'use client';

import type { CalculateMealNutritionOutput } from '@/ai/flows/nutrient-calculation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';


type MealAnalysisResultsProps = {
  result: CalculateMealNutritionOutput | null;
  isLoading: boolean;
};

const COLORS = ['#A7D9A9', '#26A69A', '#F0F0F0']; // Primary, Accent, Secondary

export function MealAnalysisResults({ result, isLoading }: MealAnalysisResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
         <Skeleton className="h-8 w-1/2 mt-4" />
         <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!result) {
    return null; // Don't render anything if not loading and no result
  }

  const macroData = [
    { name: 'Karbonhidrat', value: result.carbohydrates },
    { name: 'Protein', value: result.protein },
    { name: 'Yağ', value: result.fat },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
        <Activity size={20} /> Besin Analizi
      </h3>

       <Card className="bg-secondary/50">
         <CardContent className="p-4">
           <p className="text-center text-2xl font-bold text-foreground">
             Toplam Kalori: {result.totalCalories.toFixed(0)} kcal
           </p>
         </CardContent>
       </Card>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Karbonhidratlar</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-xl font-semibold">{result.carbohydrates.toFixed(1)} g</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Protein</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-xl font-semibold">{result.protein.toFixed(1)} g</p>
           </CardContent>
         </Card>
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground">Yağ</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-xl font-semibold">{result.fat.toFixed(1)} g</p>
           </CardContent>
         </Card>
       </div>


      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Makro Besin Dağılımı</CardTitle>
        </CardHeader>
        <CardContent className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)} g`} />
               <Legend formatter={(value) => value === 'Karbonhidrat' ? 'Karbonhidratlar' : value}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


        {result.ingredients && result.ingredients.length > 0 && (
         <Card>
           <CardHeader>
             <CardTitle className="text-lg font-medium">İçerik Detayları</CardTitle>
           </CardHeader>
           <CardContent>
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>İçerik</TableHead>
                   <TableHead className="text-right">Tahmini Kalori (kcal)</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {result.ingredients.map((item, index) => (
                   <TableRow key={index}>
                     <TableCell className="font-medium">{item.name}</TableCell>
                     <TableCell className="text-right">{item.calories.toFixed(0)}</TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </CardContent>
         </Card>
       )}

    </div>
  );
}
