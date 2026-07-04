package com.studio.manager.domain.model

enum class BookingStatus(val label: String) {
    RESERVED("예약"),
    COMPLETED("이용완료"),
    CANCELLED("취소"),
    NO_SHOW("노쇼"),
}

enum class TransactionType(val label: String) {
    INCOME("수익"),
    EXPENSE("비용"),
}

data class Room(
    val id: Long = 0,
    val name: String,
    val capacity: Int,
    val hourlyRate: Long,
    val openHour: Int,
    val closeHour: Int,
    val isActive: Boolean = true,
    val note: String = "",
)

data class Member(
    val id: Long = 0,
    val name: String,
    val phone: String,
    val memo: String = "",
    val joinedAt: Long,
    val visitCount: Int = 0,
    val hasUnpaid: Boolean = false,
)

data class Booking(
    val id: Long = 0,
    val roomId: Long,
    val memberId: Long?,
    val startAt: Long,
    val endAt: Long,
    val status: BookingStatus,
    val note: String = "",
    val createdAt: Long,
)

data class Transaction(
    val id: Long = 0,
    val type: TransactionType,
    val amount: Long,
    val dateAt: Long,
    val category: String,
    val title: String,
    val memo: String = "",
    val bookingId: Long? = null,
    val memberId: Long? = null,
    val roomId: Long? = null,
    val isCancelled: Boolean = false,
)

data class MonthlyProfitSummary(
    val year: Int,
    val month: Int,
    val totalIncome: Long,
    val totalExpense: Long,
    val netProfit: Long,
)

data class DashboardSummary(
    val todayBookingCount: Int,
    val monthIncome: Long,
    val monthExpense: Long,
    val vacancyRatePercent: Int,
    val unpaidMemberCount: Int,
    val unpaidTotal: Long,
)

data class TimeSlot(
    val startAt: Long,
    val endAt: Long,
    val isAvailable: Boolean,
)
