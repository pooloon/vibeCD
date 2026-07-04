package com.studio.manager.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "bookings",
    foreignKeys = [
        ForeignKey(
            entity = RoomEntity::class,
            parentColumns = ["id"],
            childColumns = ["roomId"],
            onDelete = ForeignKey.RESTRICT,
        ),
        ForeignKey(
            entity = MemberEntity::class,
            parentColumns = ["id"],
            childColumns = ["memberId"],
            onDelete = ForeignKey.SET_NULL,
        ),
    ],
    indices = [
        Index("roomId"),
        Index("memberId"),
        Index("startAt"),
        Index("endAt"),
    ],
)
data class BookingEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val roomId: Long,
    val memberId: Long?,
    val startAt: Long,
    val endAt: Long,
    val status: String,
    val note: String = "",
    val createdAt: Long,
)
