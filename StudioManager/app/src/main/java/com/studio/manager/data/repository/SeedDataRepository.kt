package com.studio.manager.data.repository

import com.studio.manager.data.local.StudioDatabase
import com.studio.manager.data.local.entity.BookingEntity
import com.studio.manager.data.local.entity.MemberEntity
import com.studio.manager.data.local.entity.TransactionEntity
import com.studio.manager.domain.model.BookingStatus
import com.studio.manager.util.DateTimeUtil
import com.studio.manager.util.ExpenseCategories
import com.studio.manager.util.IncomeCategories
import java.time.LocalDate

class SeedDataRepository(
    private val database: StudioDatabase,
    private val roomRepository: RoomRepository,
) {
    suspend fun seedIfEmpty() {
        roomRepository.ensureDefaultRooms()
        if (database.memberDao().count() > 0) return
        seedSampleData()
    }

    private suspend fun seedSampleData() {
        val memberDao = database.memberDao()
        val bookingDao = database.bookingDao()
        val transactionDao = database.transactionDao()
        val roomDao = database.roomDao()

        val now = LocalDate.now()
        val year = now.year
        val month = now.monthValue

        val members = listOf(
            MemberEntity(name = "김민수", phone = "010-1234-5678", memo = "드럼 연습", joinedAt = DateTimeUtil.nowMillis()),
            MemberEntity(name = "박지은", phone = "010-2345-6789", memo = "보컬 레슨", joinedAt = DateTimeUtil.nowMillis()),
            MemberEntity(name = "이준호", phone = "010-3456-7890", memo = "기타 연습", joinedAt = DateTimeUtil.nowMillis()),
            MemberEntity(name = "최서연", phone = "010-4567-8901", memo = "피아노", joinedAt = DateTimeUtil.nowMillis()),
            MemberEntity(name = "정하늘", phone = "010-5678-9012", memo = "밴드 합주", joinedAt = DateTimeUtil.nowMillis(), hasUnpaid = true),
        )
        val memberIds = members.map { memberDao.insert(it) }

        val rooms = roomDao.getAll()
        val room1 = rooms.first { it.name == "1" }
        val room7 = rooms.first { it.name == "7" }
        val roomS = rooms.first { it.name == "S" }

        val bookings = listOf(
            booking(room1.id, memberIds[0], year, month, now.dayOfMonth, 10, 12, BookingStatus.COMPLETED),
            booking(room7.id, memberIds[1], year, month, now.dayOfMonth, 14, 16, BookingStatus.RESERVED),
            booking(roomS.id, memberIds[2], year, month, now.dayOfMonth.coerceAtMost(28), 18, 20, BookingStatus.RESERVED),
            booking(room1.id, memberIds[3], year, month, (now.dayOfMonth + 1).coerceAtMost(28), 11, 13, BookingStatus.RESERVED),
            booking(room7.id, memberIds[4], year, month, (now.dayOfMonth + 1).coerceAtMost(28), 15, 17, BookingStatus.RESERVED),
            booking(room1.id, memberIds[0], year, month, (now.dayOfMonth + 2).coerceAtMost(28), 10, 11, BookingStatus.CANCELLED),
            booking(roomS.id, memberIds[1], year, month, (now.dayOfMonth - 1).coerceAtLeast(1), 16, 18, BookingStatus.COMPLETED),
            booking(room7.id, memberIds[2], year, month, (now.dayOfMonth - 2).coerceAtLeast(1), 13, 15, BookingStatus.NO_SHOW),
            booking(room1.id, memberIds[3], year, month, (now.dayOfMonth - 3).coerceAtLeast(1), 19, 21, BookingStatus.COMPLETED),
            booking(roomS.id, memberIds[4], year, month, now.dayOfMonth, 20, 22, BookingStatus.RESERVED),
        )

        val bookingIds = bookings.map { bookingDao.insert(it) }

        val transactions = listOf(
            TransactionEntity(type = "INCOME", amount = 30_000, dateAt = bookings[0].endAt, category = IncomeCategories.ALL[0], title = "1호 예약 이용", bookingId = bookingIds[0], memberId = memberIds[0], roomId = room1.id),
            TransactionEntity(type = "INCOME", amount = 30_000, dateAt = bookings[6].endAt, category = IncomeCategories.ALL[0], title = "S호 예약 이용", bookingId = bookingIds[6], memberId = memberIds[1], roomId = roomS.id),
            TransactionEntity(type = "INCOME", amount = 30_000, dateAt = bookings[8].endAt, category = IncomeCategories.ALL[0], title = "1호 예약 이용", bookingId = bookingIds[8], memberId = memberIds[3], roomId = room1.id),
            TransactionEntity(type = "INCOME", amount = 50_000, dateAt = DateTimeUtil.atDateTime(year, month, 5, 12), category = IncomeCategories.ALL[2], title = "기타 수입", memo = "장비 대여"),
            TransactionEntity(type = "INCOME", amount = 400_000, dateAt = DateTimeUtil.atDateTime(year, month, 1, 10), category = IncomeCategories.ALL[1], title = "7호 월세", memberId = memberIds[1], roomId = room7.id),
            TransactionEntity(type = "EXPENSE", amount = 120_000, dateAt = DateTimeUtil.atDateTime(year, month, 5, 9), category = ExpenseCategories.ALL[1], title = "전기요금"),
            TransactionEntity(type = "EXPENSE", amount = 80_000, dateAt = DateTimeUtil.atDateTime(year, month, 10, 9), category = ExpenseCategories.ALL[3], title = "건물 관리비"),
            TransactionEntity(type = "EXPENSE", amount = 45_000, dateAt = DateTimeUtil.atDateTime(year, month, 12, 14), category = ExpenseCategories.ALL[2], title = "에어컨 수리", roomId = room1.id),
            TransactionEntity(type = "EXPENSE", amount = 1_500_000, dateAt = DateTimeUtil.atDateTime(year, month, 1, 10), category = ExpenseCategories.ALL[0], title = "임대료"),
            TransactionEntity(type = "EXPENSE", amount = 25_000, dateAt = DateTimeUtil.atDateTime(year, month, 18, 11), category = ExpenseCategories.ALL[4], title = "소모품 구입"),
        )
        transactions.forEach { transactionDao.insert(it) }
    }

    private fun booking(
        roomId: Long,
        memberId: Long,
        year: Int,
        month: Int,
        day: Int,
        startHour: Int,
        endHour: Int,
        status: BookingStatus,
    ): BookingEntity = BookingEntity(
        roomId = roomId,
        memberId = memberId,
        startAt = DateTimeUtil.atDateTime(year, month, day, startHour),
        endAt = DateTimeUtil.atDateTime(year, month, day, endHour),
        status = status.name,
        createdAt = DateTimeUtil.nowMillis(),
    )
}
