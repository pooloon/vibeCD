package com.studio.manager.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.studio.manager.data.local.entity.TransactionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions ORDER BY dateAt DESC")
    fun observeAll(): Flow<List<TransactionEntity>>

    @Query(
        """
        SELECT * FROM transactions
        WHERE dateAt >= :monthStart AND dateAt <= :monthEnd
        ORDER BY dateAt DESC
        """,
    )
    fun observeByMonth(monthStart: Long, monthEnd: Long): Flow<List<TransactionEntity>>

    @Query(
        """
        SELECT COALESCE(SUM(amount), 0) FROM transactions
        WHERE type = 'INCOME' AND isCancelled = 0
          AND dateAt >= :monthStart AND dateAt <= :monthEnd
        """,
    )
    suspend fun sumIncome(monthStart: Long, monthEnd: Long): Long

    @Query(
        """
        SELECT COALESCE(SUM(amount), 0) FROM transactions
        WHERE type = 'EXPENSE' AND isCancelled = 0
          AND dateAt >= :monthStart AND dateAt <= :monthEnd
        """,
    )
    suspend fun sumExpense(monthStart: Long, monthEnd: Long): Long

    @Query("SELECT * FROM transactions WHERE bookingId = :bookingId")
    suspend fun getByBookingId(bookingId: Long): List<TransactionEntity>

    @Query("SELECT * FROM transactions WHERE id = :id")
    suspend fun getById(id: Long): TransactionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(transaction: TransactionEntity): Long

    @Update
    suspend fun update(transaction: TransactionEntity)

    @Query("DELETE FROM transactions WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("SELECT COUNT(*) FROM transactions")
    suspend fun count(): Int
}
