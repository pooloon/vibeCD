package com.studio.manager.data.repository

import com.studio.manager.data.local.StudioDatabase
import com.studio.manager.data.local.toDomain
import com.studio.manager.data.local.toEntity
import com.studio.manager.domain.model.Booking
import com.studio.manager.domain.model.BookingStatus
import com.studio.manager.domain.model.Transaction
import com.studio.manager.domain.model.TransactionType
import com.studio.manager.util.DateTimeUtil
import com.studio.manager.util.IncomeCategories
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlin.math.ceil

class BookingRepository(
    private val database: StudioDatabase,
    private val transactionRepository: TransactionRepository,
) {
    private val bookingDao = database.bookingDao()
    private val roomDao = database.roomDao()
    private val memberDao = database.memberDao()

    fun observeAll(): Flow<List<Booking>> =
        bookingDao.observeAll().map { list -> list.map { it.toDomain() } }

    fun observeByDay(dayMillis: Long): Flow<List<Booking>> {
        val dayStart = DateTimeUtil.startOfDay(dayMillis)
        val dayEnd = DateTimeUtil.endOfDay(dayMillis)
        return bookingDao.observeByDay(dayStart, dayEnd).map { list ->
            list.map { it.toDomain() }
        }
    }

    suspend fun getBooking(id: Long): Booking? =
        bookingDao.getById(id)?.toDomain()

    suspend fun hasConflict(
        roomId: Long,
        startAt: Long,
        endAt: Long,
        excludeId: Long? = null,
    ): Boolean = bookingDao.countConflicts(roomId, startAt, endAt, excludeId) > 0

    suspend fun createBooking(
        roomId: Long,
        memberId: Long?,
        startAt: Long,
        endAt: Long,
        note: String = "",
    ): Result<Long> {
        if (endAt <= startAt) {
            return Result.failure(IllegalArgumentException("종료 시간은 시작 시간보다 늦어야 합니다."))
        }
        if (hasConflict(roomId, startAt, endAt)) {
            return Result.failure(IllegalStateException("해당 시간대에 이미 예약이 있습니다."))
        }

        val bookingId = bookingDao.insert(
            Booking(
                roomId = roomId,
                memberId = memberId,
                startAt = startAt,
                endAt = endAt,
                status = BookingStatus.RESERVED,
                note = note,
                createdAt = DateTimeUtil.nowMillis(),
            ).toEntity(),
        )
        return Result.success(bookingId)
    }

    suspend fun updateBookingStatus(
        bookingId: Long,
        newStatus: BookingStatus,
    ): Result<Unit> {
        val booking = bookingDao.getById(bookingId)?.toDomain()
            ?: return Result.failure(IllegalArgumentException("예약을 찾을 수 없습니다."))

        val oldStatus = booking.status
        if (oldStatus == newStatus) return Result.success(Unit)

        bookingDao.update(booking.copy(status = newStatus).toEntity())

        when {
            newStatus == BookingStatus.COMPLETED && oldStatus != BookingStatus.COMPLETED -> {
                createIncomeForCompletedBooking(bookingId)
                incrementMemberVisitCount(booking.memberId)
            }
            oldStatus == BookingStatus.COMPLETED && newStatus != BookingStatus.COMPLETED -> {
                transactionRepository.cancelIncomeByBooking(bookingId)
            }
            newStatus == BookingStatus.CANCELLED -> {
                transactionRepository.cancelIncomeByBooking(bookingId)
            }
        }

        return Result.success(Unit)
    }

    suspend fun cancelBooking(bookingId: Long): Result<Unit> =
        updateBookingStatus(bookingId, BookingStatus.CANCELLED)

    private suspend fun createIncomeForCompletedBooking(bookingId: Long) {
        val existing = transactionRepository.getByBookingId(bookingId)
        if (existing.any { it.type == TransactionType.INCOME && !it.isCancelled }) return

        val booking = bookingDao.getById(bookingId)?.toDomain() ?: return
        val room = roomDao.getById(booking.roomId) ?: return
        val hours = ceil((booking.endAt - booking.startAt).toDouble() / 3_600_000.0).toLong()
            .coerceAtLeast(1)
        val amount = room.hourlyRate * hours

        transactionRepository.addTransaction(
            Transaction(
                type = TransactionType.INCOME,
                amount = amount,
                dateAt = booking.endAt,
                category = IncomeCategories.ALL.first(),
                title = "${room.name}호 예약 이용",
                memo = booking.note,
                bookingId = bookingId,
                memberId = booking.memberId,
                roomId = booking.roomId,
            ),
        )
    }

    private suspend fun incrementMemberVisitCount(memberId: Long?) {
        if (memberId == null) return
        val member = memberDao.getById(memberId) ?: return
        memberDao.update(member.copy(visitCount = member.visitCount + 1))
    }

    suspend fun countTodayBookings(): Int {
        val now = DateTimeUtil.nowMillis()
        return bookingDao.countToday(
            DateTimeUtil.startOfDay(now),
            DateTimeUtil.endOfDay(now),
        )
    }
}
