package com.studio.manager.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "transactions",
    foreignKeys = [
        ForeignKey(
            entity = BookingEntity::class,
            parentColumns = ["id"],
            childColumns = ["bookingId"],
            onDelete = ForeignKey.SET_NULL,
        ),
        ForeignKey(
            entity = MemberEntity::class,
            parentColumns = ["id"],
            childColumns = ["memberId"],
            onDelete = ForeignKey.SET_NULL,
        ),
        ForeignKey(
            entity = RoomEntity::class,
            parentColumns = ["id"],
            childColumns = ["roomId"],
            onDelete = ForeignKey.SET_NULL,
        ),
    ],
    indices = [
        Index("bookingId"),
        Index("memberId"),
        Index("roomId"),
        Index("dateAt"),
        Index("type"),
    ],
)
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val type: String,
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
