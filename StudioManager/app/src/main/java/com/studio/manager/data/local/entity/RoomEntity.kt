package com.studio.manager.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "rooms")
data class RoomEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val capacity: Int,
    val hourlyRate: Long,
    val openHour: Int,
    val closeHour: Int,
    val isActive: Boolean = true,
    val note: String = "",
)
