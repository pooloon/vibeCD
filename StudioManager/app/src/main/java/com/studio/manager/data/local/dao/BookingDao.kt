package com.studio.manager.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.studio.manager.data.local.entity.BookingEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BookingDao {
    @Query("SELECT * FROM bookings ORDER BY startAt DESC")
    fun observeAll(): Flow<List<BookingEntity>>

    @Query(
        """
        SELECT * FROM bookings
        WHERE startAt >= :dayStart AND startAt <= :dayEnd
        ORDER BY startAt
        """,
    )
    fun observeByDay(dayStart: Long, dayEnd: Long): Flow<List<BookingEntity>>

    @Query(
        """
        SELECT * FROM bookings
        WHERE startAt >= :rangeStart AND startAt < :rangeEnd
        ORDER BY startAt
        """,
    )
    suspend fun getInRange(rangeStart: Long, rangeEnd: Long): List<BookingEntity>

    @Query("SELECT * FROM bookings WHERE id = :id")
    suspend fun getById(id: Long): BookingEntity?

    @Query(
        """
        SELECT COUNT(*) FROM bookings
        WHERE roomId = :roomId
          AND status != 'CANCELLED'
          AND startAt < :endAt
          AND endAt > :startAt
          AND (:excludeId IS NULL OR id != :excludeId)
        """,
    )
    suspend fun countConflicts(
        roomId: Long,
        startAt: Long,
        endAt: Long,
        excludeId: Long? = null,
    ): Int

    @Query(
        """
        SELECT COUNT(*) FROM bookings
        WHERE startAt >= :dayStart AND startAt <= :dayEnd
          AND status != 'CANCELLED'
        """,
    )
    suspend fun countToday(dayStart: Long, dayEnd: Long): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(booking: BookingEntity): Long

    @Update
    suspend fun update(booking: BookingEntity)

    @Query("SELECT COUNT(*) FROM bookings")
    suspend fun count(): Int
}
