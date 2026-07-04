package com.studio.manager.data.repository

import com.studio.manager.data.local.StudioDatabase
import com.studio.manager.data.local.entity.RoomEntity
import com.studio.manager.data.local.toDomain
import com.studio.manager.data.local.toEntity
import com.studio.manager.domain.model.Room
import com.studio.manager.util.RoomDefaults
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class RoomRepository(
    private val database: StudioDatabase,
) {
    private val dao = database.roomDao()

    fun observeActiveRooms(): Flow<List<Room>> =
        dao.observeActive().map { list -> list.map { it.toDomain() } }

    fun observeAllRooms(): Flow<List<Room>> =
        dao.observeAll().map { list -> list.map { it.toDomain() } }

    suspend fun getAllRooms(): List<Room> =
        dao.getAll().map { it.toDomain() }

    suspend fun getRoom(id: Long): Room? =
        dao.getById(id)?.toDomain()

    suspend fun upsert(room: Room): Long =
        if (room.id == 0L) {
            dao.insert(room.toEntity())
        } else {
            dao.update(room.toEntity())
            room.id
        }

    suspend fun ensureDefaultRooms() {
        if (dao.count() > 0) return
        val defaults = RoomDefaults.ROOM_NAMES.map { name ->
            RoomEntity(
                name = name,
                capacity = RoomDefaults.DEFAULT_CAPACITY,
                hourlyRate = RoomDefaults.DEFAULT_HOURLY_RATE,
                openHour = RoomDefaults.DEFAULT_OPEN_HOUR,
                closeHour = RoomDefaults.DEFAULT_CLOSE_HOUR,
                isActive = true,
            )
        }
        dao.insertAll(defaults)
    }
}
