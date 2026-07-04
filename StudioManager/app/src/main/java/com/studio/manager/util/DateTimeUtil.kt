package com.studio.manager.util

import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

object DateTimeUtil {
    private val zone = ZoneId.of("Asia/Seoul")
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy년 M월 d일", Locale.KOREA)
    private val dateTimeFormatter = DateTimeFormatter.ofPattern("M/d HH:mm", Locale.KOREA)
    private val monthFormatter = DateTimeFormatter.ofPattern("yyyy년 M월", Locale.KOREA)

    fun nowMillis(): Long = System.currentTimeMillis()

    fun toLocalDate(millis: Long): LocalDate =
        Instant.ofEpochMilli(millis).atZone(zone).toLocalDate()

    fun toLocalDateTime(millis: Long): LocalDateTime =
        Instant.ofEpochMilli(millis).atZone(zone).toLocalDateTime()

    fun atStartOfDay(year: Int, month: Int, day: Int): Long =
        LocalDate.of(year, month, day).atStartOfDay(zone).toInstant().toEpochMilli()

    fun atDateTime(year: Int, month: Int, day: Int, hour: Int, minute: Int = 0): Long =
        LocalDateTime.of(year, month, day, hour, minute).atZone(zone).toInstant().toEpochMilli()

    fun formatDate(millis: Long): String = dateFormatter.format(toLocalDate(millis))

    fun formatDateTime(millis: Long): String = dateTimeFormatter.format(toLocalDateTime(millis))

    fun formatMonth(year: Int, month: Int): String =
        monthFormatter.format(LocalDate.of(year, month, 1))

    fun startOfMonth(year: Int, month: Int): Long =
        LocalDate.of(year, month, 1).atStartOfDay(zone).toInstant().toEpochMilli()

    fun endOfMonth(year: Int, month: Int): Long {
        val lastDay = LocalDate.of(year, month, 1).lengthOfMonth()
        return LocalDate.of(year, month, lastDay)
            .plusDays(1)
            .atStartOfDay(zone)
            .toInstant()
            .toEpochMilli() - 1
    }

    fun startOfDay(millis: Long): Long =
        toLocalDate(millis).atStartOfDay(zone).toInstant().toEpochMilli()

    fun endOfDay(millis: Long): Long =
        toLocalDate(millis).plusDays(1).atStartOfDay(zone).toInstant().toEpochMilli() - 1
}
