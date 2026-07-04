package com.studio.manager.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.studio.manager.data.local.dao.BookingDao
import com.studio.manager.data.local.dao.MemberDao
import com.studio.manager.data.local.dao.RoomDao
import com.studio.manager.data.local.dao.TransactionDao
import com.studio.manager.data.local.entity.BookingEntity
import com.studio.manager.data.local.entity.MemberEntity
import com.studio.manager.data.local.entity.RoomEntity
import com.studio.manager.data.local.entity.TransactionEntity

@Database(
    entities = [
        RoomEntity::class,
        MemberEntity::class,
        BookingEntity::class,
        TransactionEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class StudioDatabase : RoomDatabase() {
    abstract fun roomDao(): RoomDao
    abstract fun memberDao(): MemberDao
    abstract fun bookingDao(): BookingDao
    abstract fun transactionDao(): TransactionDao

    companion object {
        @Volatile
        private var instance: StudioDatabase? = null

        fun getInstance(context: Context): StudioDatabase =
            instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    StudioDatabase::class.java,
                    "studio_manager.db",
                )
                    .fallbackToDestructiveMigration()
                    .build()
                    .also { instance = it }
            }
    }
}
