package com.studio.manager.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.studio.manager.data.local.entity.RoomEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RoomDao {
    @Query("SELECT * FROM rooms ORDER BY name")
    fun observeAll(): Flow<List<RoomEntity>>

    @Query("SELECT * FROM rooms WHERE isActive = 1 ORDER BY name")
    fun observeActive(): Flow<List<RoomEntity>>

    @Query("SELECT * FROM rooms ORDER BY name")
    suspend fun getAll(): List<RoomEntity>

    @Query("SELECT * FROM rooms WHERE id = :id")
    suspend fun getById(id: Long): RoomEntity?

    @Query("SELECT * FROM rooms WHERE name = :name LIMIT 1")
    suspend fun getByName(name: String): RoomEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(room: RoomEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(rooms: List<RoomEntity>)

    @Update
    suspend fun update(room: RoomEntity)

    @Query("SELECT COUNT(*) FROM rooms")
    suspend fun count(): Int
}
