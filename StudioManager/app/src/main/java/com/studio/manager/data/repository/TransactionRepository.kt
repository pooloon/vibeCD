package com.studio.manager.data.repository

import com.studio.manager.data.local.StudioDatabase
import com.studio.manager.data.local.toDomain
import com.studio.manager.data.local.toEntity
import com.studio.manager.domain.model.MonthlyProfitSummary
import com.studio.manager.domain.model.Transaction
import com.studio.manager.domain.model.TransactionType
import com.studio.manager.util.DateTimeUtil
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.LocalDate

class TransactionRepository(
    private val database: StudioDatabase,
) {
    private val dao = database.transactionDao()

    fun observeAll(): Flow<List<Transaction>> =
        dao.observeAll().map { list -> list.map { it.toDomain() } }

    fun observeByMonth(year: Int, month: Int): Flow<List<Transaction>> {
        val start = DateTimeUtil.startOfMonth(year, month)
        val end = DateTimeUtil.endOfMonth(year, month)
        return dao.observeByMonth(start, end).map { list -> list.map { it.toDomain() } }
    }

    suspend fun addTransaction(transaction: Transaction): Long =
        dao.insert(transaction.toEntity())

    suspend fun getByBookingId(bookingId: Long): List<Transaction> =
        dao.getByBookingId(bookingId).map { it.toDomain() }

    suspend fun cancelIncomeByBooking(bookingId: Long) {
        val linked = dao.getByBookingId(bookingId)
        linked.filter { it.type == TransactionType.INCOME.name && !it.isCancelled }
            .forEach { entity ->
                dao.update(entity.copy(isCancelled = true))
            }
    }

    suspend fun getMonthlySummary(year: Int, month: Int): MonthlyProfitSummary {
        val start = DateTimeUtil.startOfMonth(year, month)
        val end = DateTimeUtil.endOfMonth(year, month)
        val income = dao.sumIncome(start, end)
        val expense = dao.sumExpense(start, end)
        return MonthlyProfitSummary(
            year = year,
            month = month,
            totalIncome = income,
            totalExpense = expense,
            netProfit = income - expense,
        )
    }

    suspend fun getMonthIncomeExpense(year: Int, month: Int): Pair<Long, Long> {
        val summary = getMonthlySummary(year, month)
        return summary.totalIncome to summary.totalExpense
    }
}
