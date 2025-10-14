// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@heroui/react';
import { Users, Calendar, TrendingUp, Shield } from 'lucide-react';
import { Camp, Registration, User, CampStatus } from '@/types/camp';

export default function AdminDashboard() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [campsRes, usersRes, regsRes] = await Promise.all([
        fetch('/api/camps'),
        fetch('/api/users'),
        fetch('/api/registrations/all'),
      ]);

      const campsData = await campsRes.json();
      const usersData = await usersRes.json();
      const regsData = await regsRes.json();

      setCamps(campsData.camps || []);
      setUsers(usersData.users || []);
      setRegistrations(regsData.registrations || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: CampStatus) => {
    switch (status) {
      case CampStatus.ACTIVE: return 'success';
      case CampStatus.FULL: return 'warning';
      case CampStatus.CLOSED: return 'default';
      case CampStatus.CANCELLED: return 'danger';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'organizer': return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">จัดการระบบและดูภาพรวมทั้งหมด</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">ค่ายทั้งหมด</p>
                <p className="text-3xl font-bold">{camps.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm mb-1">ผู้ใช้ทั้งหมด</p>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
              <Users className="w-12 h-12 text-indigo-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm mb-1">การสมัครทั้งหมด</p>
                <p className="text-3xl font-bold">{registrations.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-pink-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">ผู้ใช้งานทั่วไป</p>
                <p className="text-3xl font-bold">{users.filter(u => u.role === 'user').length}</p>
              </div>
              <Shield className="w-12 h-12 text-blue-200" />
            </div>
          </Card>
        </div>

        {/* Tables */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ค่ายทั้งหมด</h2>
          <Table aria-label="Camps table">
            <TableHeader>
              <TableColumn>ชื่อค่าย</TableColumn>
              <TableColumn>ผู้จัด</TableColumn>
              <TableColumn>วันที่</TableColumn>
              <TableColumn>ผู้เข้าร่วม</TableColumn>
              <TableColumn>สถานะ</TableColumn>
            </TableHeader>
            <TableBody>
              {camps.map((camp) => (
                <TableRow key={camp._id}>
                  <TableCell>{camp.name}</TableCell>
                  <TableCell>{camp.organizerName}</TableCell>
                  <TableCell>{new Date(camp.startDate).toLocaleDateString('th-TH')}</TableCell>
                  <TableCell>{camp.enrolled}/{camp.capacity}</TableCell>
                  <TableCell>
                    <Chip color={getStatusColor(camp.status)} size="sm" variant="flat">
                      {camp.status === CampStatus.ACTIVE ? 'เปิดใช้งาน' : 
                       camp.status === CampStatus.FULL ? 'เต็ม' : 
                       camp.status === CampStatus.CLOSED ? 'ปิด' : 'ยกเลิก'}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ผู้ใช้ทั้งหมด</h2>
          <Table aria-label="Users table">
            <TableHeader>
              <TableColumn>ชื่อ</TableColumn>
              <TableColumn>อีเมล</TableColumn>
              <TableColumn>บทบาท</TableColumn>
              <TableColumn>วันที่สมัคร</TableColumn>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip color={getRoleColor(user.role)} size="sm" variant="flat">
                      {user.role === 'admin' ? 'ผู้ดูแลระบบ' :
                       user.role === 'organizer' ? 'ผู้จัดงาน' : 'ผู้ใช้ทั่วไป'}
                    </Chip>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('th-TH')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}