package com.studio.manager

import android.app.Application
import com.studio.manager.data.local.StudioDatabase
import com.studio.manager.data.repository.BookingRepository
import com.studio.manager.data.repository.DashboardRepository
import com.studio.manager.data.repository.MemberRepository
import com.studio.manager.data.repository.RoomRepository
import com.studio.manager.data.repository.SeedDataRepository
import com.studio.manager.data.repository.TransactionRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class AppContainer(application: Application) {
    private val database = StudioDatabase.getInstance(application)

    val transactionRepository = TransactionRepository(database)
    val roomRepository = RoomRepository(database)
    val memberRepository = MemberRepository(database)
    val bookingRepository = BookingRepository(database, transactionRepository)
    val dashboardRepository = DashboardRepository(
        database = database,
        bookingRepository = bookingRepository,
        transactionRepository = transactionRepository,
        roomRepository = roomRepository,
        memberRepository = memberRepository,
    )
    val seedDataRepository = SeedDataRepository(database, roomRepository)
}

class StudioManagerApp : Application() {
    lateinit var container: AppContainer
        private set

    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        appScope.launch {
            container.seedDataRepository.seedIfEmpty()
        }
    }
}
