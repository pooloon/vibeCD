package com.studio.manager.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "members")
data class MemberEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val phone: String,
    val memo: String = "",
    val joinedAt: Long,
    val visitCount: Int = 0,
    val hasUnpaid: Boolean = false,
)
