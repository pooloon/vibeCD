package com.studio.manager.data.repository

import com.studio.manager.data.local.StudioDatabase
import com.studio.manager.data.local.toDomain
import com.studio.manager.data.local.toEntity
import com.studio.manager.domain.model.Member
import com.studio.manager.util.DateTimeUtil
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class MemberRepository(
    private val database: StudioDatabase,
) {
    private val dao = database.memberDao()

    fun observeMembers(): Flow<List<Member>> =
        dao.observeAll().map { list -> list.map { it.toDomain() } }

    suspend fun getMember(id: Long): Member? =
        dao.getById(id)?.toDomain()

    suspend fun addMember(
        name: String,
        phone: String,
        memo: String = "",
    ): Long = dao.insert(
        Member(
            name = name,
            phone = phone,
            memo = memo,
            joinedAt = DateTimeUtil.nowMillis(),
        ).toEntity(),
    )

    suspend fun updateMember(member: Member) {
        dao.update(member.toEntity())
    }

    suspend fun deleteMember(id: Long) {
        dao.deleteById(id)
    }

    suspend fun getUnpaidMembers(): List<Member> =
        dao.getUnpaidMembers().map { it.toDomain() }
}
