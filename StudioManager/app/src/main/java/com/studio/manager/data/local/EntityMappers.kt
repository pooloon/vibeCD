package com.studio.manager.data.local

import com.studio.manager.data.local.entity.BookingEntity
import com.studio.manager.data.local.entity.MemberEntity
import com.studio.manager.data.local.entity.RoomEntity
import com.studio.manager.data.local.entity.TransactionEntity
import com.studio.manager.domain.model.Booking
import com.studio.manager.domain.model.BookingStatus
import com.studio.manager.domain.model.Member
import com.studio.manager.domain.model.Room
import com.studio.manager.domain.model.Transaction
import com.studio.manager.domain.model.TransactionType

fun RoomEntity.toDomain(): Room = Room(
    id = id,
    name = name,
    capacity = capacity,
    hourlyRate = hourlyRate,
    openHour = openHour,
    closeHour = closeHour,
    isActive = isActive,
    note = note,
)

fun Room.toEntity(): RoomEntity = RoomEntity(
    id = id,
    name = name,
    capacity = capacity,
    hourlyRate = hourlyRate,
    openHour = openHour,
    closeHour = closeHour,
    isActive = isActive,
    note = note,
)

fun MemberEntity.toDomain(): Member = Member(
    id = id,
    name = name,
    phone = phone,
    memo = memo,
    joinedAt = joinedAt,
    visitCount = visitCount,
    hasUnpaid = hasUnpaid,
)

fun Member.toEntity(): MemberEntity = MemberEntity(
    id = id,
    name = name,
    phone = phone,
    memo = memo,
    joinedAt = joinedAt,
    visitCount = visitCount,
    hasUnpaid = hasUnpaid,
)

fun BookingEntity.toDomain(): Booking = Booking(
    id = id,
    roomId = roomId,
    memberId = memberId,
    startAt = startAt,
    endAt = endAt,
    status = BookingStatus.valueOf(status),
    note = note,
    createdAt = createdAt,
)

fun Booking.toEntity(): BookingEntity = BookingEntity(
    id = id,
    roomId = roomId,
    memberId = memberId,
    startAt = startAt,
    endAt = endAt,
    status = status.name,
    note = note,
    createdAt = createdAt,
)

fun TransactionEntity.toDomain(): Transaction = Transaction(
    id = id,
    type = TransactionType.valueOf(type),
    amount = amount,
    dateAt = dateAt,
    category = category,
    title = title,
    memo = memo,
    bookingId = bookingId,
    memberId = memberId,
    roomId = roomId,
    isCancelled = isCancelled,
)

fun Transaction.toEntity(): TransactionEntity = TransactionEntity(
    id = id,
    type = type.name,
    amount = amount,
    dateAt = dateAt,
    category = category,
    title = title,
    memo = memo,
    bookingId = bookingId,
    memberId = memberId,
    roomId = roomId,
    isCancelled = isCancelled,
)
