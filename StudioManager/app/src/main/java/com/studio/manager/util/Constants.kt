package com.studio.manager.util

object RoomDefaults {
    val ROOM_NAMES = listOf(
        "1", "2", "3", "4", "7", "8", "9", "10",
        "13", "14", "15", "16", "17", "S",
    )

    const val DEFAULT_CAPACITY = 2
    const val DEFAULT_HOURLY_RATE = 15_000L
    const val DEFAULT_OPEN_HOUR = 9
    const val DEFAULT_CLOSE_HOUR = 23
}

object ExpenseCategories {
    val ALL = listOf("임대료", "전기", "수리", "관리비", "기타")
}

object IncomeCategories {
    val ALL = listOf("예약", "월세", "기타")
}
