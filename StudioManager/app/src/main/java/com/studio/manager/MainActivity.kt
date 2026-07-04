package com.studio.manager

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.studio.manager.domain.model.DashboardSummary
import com.studio.manager.ui.theme.StudioManagerTheme
import com.studio.manager.util.toKrwString
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val container = (application as StudioManagerApp).container

        setContent {
            StudioManagerTheme {
                Phase2PreviewScreen(
                    loadSummary = {
                        withContext(Dispatchers.IO) {
                            container.dashboardRepository.getDashboardSummary()
                        }
                    },
                )
            }
        }
    }
}

@Composable
private fun Phase2PreviewScreen(
    loadSummary: suspend () -> DashboardSummary,
) {
    var summary by remember { mutableStateOf<DashboardSummary?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        try {
            summary = loadSummary()
        } catch (e: Exception) {
            error = e.message
        }
    }

    Scaffold { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            when {
                error != null -> Text("오류: $error", color = MaterialTheme.colorScheme.error)
                summary == null -> CircularProgressIndicator()
                else -> {
                    val data = summary!!
                    Text("연습실 관리", style = MaterialTheme.typography.headlineMedium)
                    Text("Phase 1–2 빌드 확인", modifier = Modifier.padding(top = 8.dp))
                    Text("오늘 예약: ${data.todayBookingCount}건", modifier = Modifier.padding(top = 16.dp))
                    Text("이번 달 매출: ${data.monthIncome.toKrwString()}")
                    Text("이번 달 지출: ${data.monthExpense.toKrwString()}")
                    Text("공실률: ${data.vacancyRatePercent}%")
                    Text("미수금 회원: ${data.unpaidMemberCount}명")
                }
            }
        }
    }
}
