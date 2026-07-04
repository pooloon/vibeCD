package com.studio.manager.data.repository

import com.studio.manager.data.local.StudioDatabase
import com.studio.manager.domain.model.BookingStatus
import com.studio.manager.domain.model.DashboardSummary
import com.studio.manager.domain.model.TimeSlot
import com.studio.manager.util.DateTimeUtil
import java.time.LocalDate

class DashboardRepository(
    private val database: StudioDatabase,
    private val bookingRepository: BookingRepository,
    private val transactionRepository: TransactionRepository,
    private val roomRepository: RoomRepository,
    private val memberRepository: MemberRepository,
) {
    suspend fun getDashboardSummary(): DashboardSummary {
        val today = LocalDate.now()
        val year = today.year
        val month = today.monthValue
        val now = DateTimeUtil.nowMillis()

        val todayCount = bookingRepository.countTodayBookings()
        val (income, expense) = transactionRepository.getMonthIncomeExpense(year, month)
        val unpaidMembers = memberRepository.getUnpaidMembers()
        val vacancyRate = calculateVacancyRate(now)

        return DashboardSummary(
            todayBookingCount = todayCount,
            monthIncome = income,
            monthExpense = expense,
            vacancyRatePercent = vacancyRate,
            unpaidMemberCount = unpaidMembers.size,
            unpaidTotal = 0L,
        )
    }

    private suspend fun calculateVacancyRate(atMillis: Long): Int {
        val rooms = roomRepository.getAllRooms().filter { it.isActive }
        if (rooms.isEmpty()) return 100

        val dayStart = DateTimeUtil.startOfDay(atMillis)
        val dayEnd = DateTimeUtil.endOfDay(atMillis)
        val bookings = database.bookingDao().getInRange(dayStart, dayEnd + 1)
            .filter { it.status != BookingStatus.CANCELLED.name }

        var totalSlots = 0
        var occupiedSlots = 0

        rooms.forEach { room ->
            val hours = (room.closeHour - room.openHour).coerceAtLeast(1)
            totalSlots += hours
            bookings.filter { it.roomId == room.id }.forEach { booking ->
                val startHour = DateTimeUtil.toLocalDateTime(booking.startAt).hour
                val endHour = DateTimeUtil.toLocalDateTime(booking.endAt).hour
                occupiedSlots += (endHour - startHour).coerceAtLeast(1)
            }
        }

        if (totalSlots == 0) return 100
        val vacant = (totalSlots - occupiedSlots).coerceAtLeast(0)
        return ((vacant.toDouble() / totalSlots) * 100).toInt()
    }

    suspend fun getAvailableNow(): List<Pair<String, Boolean>> {
        val now = DateTimeUtil.nowMillis()
        val rooms = roomRepository.getAllRooms().filter { it.isActive }
        val dayStart = DateTimeUtil.startOfDay(now)
        val dayEnd = DateTimeUtil.endOfDay(now)
        val bookings = database.bookingDao().getInRange(dayStart, dayEnd + 1)
            .filter { it.status != BookingStatus.CANCELLED.name }

        return rooms.map { room ->
            val busy = bookings.any { booking ->
                booking.roomId == room.id &&
                    booking.startAt <= now &&
                    booking.endAt > now
            }
            room.name to !busy
        }
    }

    suspend fun getTimeSlotsForRoom(
        roomId: Long,
        dayMillis: Long,
    ): List<TimeSlot> {
        val room = roomRepository.getRoom(roomId) ?: return emptyList()
        val date = DateTimeUtil.toLocalDate(dayMillis)
        val dayStart = DateTimeUtil.startOfDay(dayMillis)
        val dayEnd = DateTimeUtil.endOfDay(dayMillis)
        val bookings = database.bookingDao().getInRange(dayStart, dayEnd + 1)
            .filter { it.roomId == roomId && it.status != BookingStatus.CANCELLED.name }

        val slots = mutableListOf<TimeSlot>()
        for (hour in room.openHour until room.closeHour) {
            val slotStart = DateTimeUtil.atDateTime(date.year, date.monthValue, date.dayOfMonth, hour)
            val slotEnd = DateTimeUtil.atDateTime(date.year, date.monthValue, date.dayOfMonth, hour + 1)
            val conflict = bookings.any { it.startAt < slotEnd && it.endAt > slotStart }
            slots.add(TimeSlot(slotStart, slotEnd, !conflict))
        }
        return slots
    }
}
