import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSales } from '@/services/api';
import { Sale } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, isAfter } from 'date-fns';

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    getSales().then(setSales).catch(console.error);
  }, []);

  const last7Days = Array.from({length: 7}).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return format(d, 'MMM d');
  });

  const chartData = last7Days.map(dayStr => {
    const daySales = sales.filter(s => format(new Date(s.created_at + 'Z'), 'MMM d') === dayStr && s.status === 'COMPLETED');
    const total = daySales.reduce((sum, s) => sum + s.total, 0) / 100;
    return { name: dayStr, total };
  });

  const todayStr = format(new Date(), 'MMM d');
  const todaySales = chartData.find(d => d.name === todayStr)?.total || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{todaySales.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Sales (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
                <Tooltip />
                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
