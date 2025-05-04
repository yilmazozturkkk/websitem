'use client';

import type { PersonalizedRecommendationsOutput, UserProfile } from '@/ai/flows/personalized-recommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Utensils, Scale, HeartPulse, Info, Apple, Carrot, Drumstick, Cookie, Droplet, Dumbbell, Brain, CalendarDays, RefreshCw, Printer } from 'lucide-react'; // Added CalendarDays, RefreshCw, Printer
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Import Button
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import { format, parseISO } from 'date-fns'; // Import date-fns
import { tr } from 'date-fns/locale'; // Import Turkish locale if needed for formatting


type UserProfileResultsProps = {
  result: PersonalizedRecommendationsOutput | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
  onRegenerate: () => void; // Callback to regenerate plan
  // onExport?: () => void; // Placeholder for export function
};

// Helper component to display meal details - Remains mostly the same
const MealDetails = ({ meal, title, icon: Icon }: { meal: NonNullable<PersonalizedRecommendationsOutput['mealPlan'][0]['breakfast']>, title: string, icon: React.ElementType }) => {
    if (!meal) return null;
    return (
        <div className="space-y-2 border-l-2 border-primary/30 pl-4 py-2 mb-3">
             <h4 className="font-semibold text-md flex items-center gap-2 text-primary">
                 <Icon size={18} /> {title} ({meal.totalCalories.toFixed(0)} kcal)
             </h4>
           <p className="font-medium text-sm">{meal.dishName}</p>
          <p className="text-sm text-foreground">{meal.description}</p>
          <p className="text-muted-foreground text-xs">Porsiyon: {meal.portionSize}</p>
          <div className="text-muted-foreground grid grid-cols-3 gap-2 text-xs font-mono">
             <span>K: {meal.macronutrients.carbohydrates.toFixed(1)}g</span>
             <span>P: {meal.macronutrients.protein.toFixed(1)}g</span>
             <span>Y: {meal.macronutrients.fat.toFixed(1)}g</span>
          </div>
           {meal.ingredients && (
              <div>
                 <p className="text-xs font-medium mt-1">İçerikler:</p>
                 <p className="text-xs text-muted-foreground">{meal.ingredients}</p>
              </div>
           )}
           {meal.substitutionSuggestions && (
              <div>
                 <p className="text-xs font-medium mt-1">Alternatifler:</p>
                 <p className="text-xs text-muted-foreground">{meal.substitutionSuggestions}</p>
              </div>
           )}
        </div>
    );
};

// Helper to format date string into a more readable format
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
        // Assuming dateString is 'YYYY-MM-DD'
        const date = parseISO(dateString);
        // Format example: "Pazartesi, 27 Mayıs 2024" (using Turkish locale)
        return format(date, "EEEE, d MMMM yyyy", { locale: tr });
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString; // Fallback to original string
    }
};


export function UserProfileResults({ result, isLoading, userProfile, onRegenerate }: UserProfileResultsProps) {
  // Show loading skeletons immediately if isLoading is true
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Skeleton className="h-24 w-full" />
           <Skeleton className="h-24 w-full" />
        </div>
         <Skeleton className="h-8 w-1/2 mt-4" />
        <Skeleton className="h-16 w-full" />

         <Skeleton className="h-8 w-1/2 mt-6" />
         <div className="space-y-2">
             <Skeleton className="h-10 w-1/3" /> {/* Tabs List Skeleton */}
             <Skeleton className="h-64 w-full mt-2" /> {/* Tab Content Skeleton */}
         </div>

         <Skeleton className="h-8 w-1/3 mt-6" />
         <Skeleton className="h-24 w-full" /> {/* Other recommendations skeleton */}
      </div>
    );
  }

  // If not loading, but no result or no user profile, render message
  if (!result || !userProfile) {
     return <p className="text-center text-muted-foreground py-6">Profil bilgileri eksik veya plan henüz oluşturulmadı.</p>;
  }

   // Validate that mealPlan exists and has data
   const hasMealPlan = result.mealPlan && result.mealPlan.length > 0;
   const isWeeklyPlan = userProfile.planType === 'weekly' && hasMealPlan && result.mealPlan.length > 1; // Check if it's a multi-day plan


  return (
    <div className="space-y-6">
        {/* Header with Regenerate Button */}
       <div className="flex justify-between items-center">
           <h3 className="text-xl font-semibold text-accent flex items-center gap-2">
             <Target size={20} /> {userProfile.name}, İşte Kişiselleştirilmiş Planınız
           </h3>
            <div className="flex gap-2">
                 <Button variant="outline" size="icon" onClick={onRegenerate} disabled={isLoading} title="Yeni Plan Oluştur">
                    <RefreshCw size={16} />
                    <span className="sr-only">Yeni Plan Oluştur</span>
                 </Button>
                 {/* Placeholder for Export Button */}
                 {/* <Button variant="outline" size="icon" onClick={onExport} disabled={isLoading} title="Planı Dışa Aktar">
                    <Printer size={16} />
                    <span className="sr-only">Planı Dışa Aktar</span>
                 </Button> */}
            </div>
       </div>


       {/* Profile Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"><Scale size={16} /> VKİ (Vücut Kitle İndeksi)</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-2xl font-bold">{result.bmi.toFixed(1)}</p>
             <p className="text-xs text-muted-foreground">
               {result.bmiInterpretation} (Sağlıklı: {result.idealWeightRange})
             </p>
           </CardContent>
         </Card>
          <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1"> <HeartPulse size={16} /> Günlük Kalori Hedefi</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-2xl font-bold">{result.recommendedDailyCalories.toFixed(0)} kcal</p>
              <p className="text-xs text-muted-foreground">
                 Hedef: {userProfile.goal === 'lose fat' ? 'Yağ Kaybı' : userProfile.goal === 'maintain' ? 'Kilo Koruma' : 'Kas Kazanımı'}
             </p>
           </CardContent>
         </Card>
      </div>

       {/* Macro Breakdown */}
       {result.macroBreakdown && (
          <Card>
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-muted-foreground">Ortalama Makro Dağılımı (%)</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-around pt-2 gap-2 flex-wrap">
                 <Badge variant="secondary">Karbonhidrat: {result.macroBreakdown.carbs?.toFixed(0) ?? 'N/A'}%</Badge>
                 <Badge variant="secondary">Protein: {result.macroBreakdown.protein?.toFixed(0) ?? 'N/A'}%</Badge>
                 <Badge variant="secondary">Yağ: {result.macroBreakdown.fats?.toFixed(0) ?? 'N/A'}%</Badge>
              </CardContent>
          </Card>
       )}


       {/* Meal Plan Section - Using Tabs for Weekly View */}
       {hasMealPlan ? (
         <Card>
            <CardHeader>
                <CardTitle className="text-lg font-medium text-primary flex items-center gap-2">
                    <CalendarDays size={18} /> {userProfile.planType === 'daily' ? 'Günlük Öğün Planı' : 'Haftalık Öğün Planı'}
                </CardTitle>
                 <CardDescription>
                    Başlangıç: {formatDate(userProfile.startDate)} - Hedef: {result.recommendedDailyCalories.toFixed(0)} kcal/gün
                 </CardDescription>
            </CardHeader>
            <CardContent>
                {isWeeklyPlan ? (
                     <Tabs defaultValue={`day-${result.mealPlan[0].date}`} className="w-full">
                       <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 h-auto mb-4">
                         {result.mealPlan.map((dailyPlan, index) => (
                           <TabsTrigger key={dailyPlan.date} value={`day-${dailyPlan.date}`} className="text-xs px-1 py-1 h-full">
                                {dailyPlan.dayOfWeek.substring(0,3)} <span className="hidden sm:inline">({format(parseISO(dailyPlan.date), "d")})</span>
                           </TabsTrigger>
                         ))}
                       </TabsList>
                       {result.mealPlan.map((dailyPlan) => (
                         <TabsContent key={dailyPlan.date} value={`day-${dailyPlan.date}`}>
                             <h4 className="font-semibold mb-3 text-center text-md text-primary">{formatDate(dailyPlan.date)}</h4>
                              <p className="text-center text-xs text-muted-foreground mb-4">
                                Günlük Toplam: {dailyPlan.dailyTotalCalories.toFixed(0)} kcal
                                (K: {dailyPlan.dailyMacronutrients.carbohydrates.toFixed(0)}g /
                                P: {dailyPlan.dailyMacronutrients.protein.toFixed(0)}g /
                                Y: {dailyPlan.dailyMacronutrients.fat.toFixed(0)}g)
                             </p>
                             <MealDetails meal={dailyPlan.breakfast} title="Kahvaltı" icon={Apple} />
                            {dailyPlan.morningSnack && <MealDetails meal={dailyPlan.morningSnack} title="Sabah Ara Öğün" icon={Carrot}/>}
                            <MealDetails meal={dailyPlan.lunch} title="Öğle Yemeği" icon={Drumstick} />
                            {dailyPlan.afternoonSnack && <MealDetails meal={dailyPlan.afternoonSnack} title="Öğleden Sonra Ara Öğün" icon={Cookie}/>}
                            <MealDetails meal={dailyPlan.dinner} title="Akşam Yemeği" icon={Utensils}/>
                            {dailyPlan.eveningSnack && <MealDetails meal={dailyPlan.eveningSnack} title="Akşam Ara Öğün" icon={Cookie}/>}
                         </TabsContent>
                       ))}
                     </Tabs>
                 ) : (
                     // Daily Plan View (or fallback if weekly has only 1 day)
                     <div>
                         <h4 className="font-semibold mb-3 text-md text-primary">{formatDate(result.mealPlan[0].date)}</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                                Günlük Toplam: {result.mealPlan[0].dailyTotalCalories.toFixed(0)} kcal
                                (K: {result.mealPlan[0].dailyMacronutrients.carbohydrates.toFixed(0)}g /
                                P: {result.mealPlan[0].dailyMacronutrients.protein.toFixed(0)}g /
                                Y: {result.mealPlan[0].dailyMacronutrients.fat.toFixed(0)}g)
                           </p>
                         <MealDetails meal={result.mealPlan[0].breakfast} title="Kahvaltı" icon={Apple} />
                         {result.mealPlan[0].morningSnack && <MealDetails meal={result.mealPlan[0].morningSnack} title="Sabah Ara Öğün" icon={Carrot}/>}
                         <MealDetails meal={result.mealPlan[0].lunch} title="Öğle Yemeği" icon={Drumstick} />
                         {result.mealPlan[0].afternoonSnack && <MealDetails meal={result.mealPlan[0].afternoonSnack} title="Öğleden Sonra Ara Öğün" icon={Cookie}/>}
                         <MealDetails meal={result.mealPlan[0].dinner} title="Akşam Yemeği" icon={Utensils}/>
                         {result.mealPlan[0].eveningSnack && <MealDetails meal={result.mealPlan[0].eveningSnack} title="Akşam Ara Öğün" icon={Cookie}/>}
                     </div>
                 )}
            </CardContent>
         </Card>
       ) : (
         // Error case if meal plan is missing
         <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                     <Info size={18} /> Öğün Planı Hatası
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-destructive">Maalesef, öğün planı oluşturulamadı veya alınamadı. Lütfen tekrar deneyin.</p>
            </CardContent>
         </Card>
       )}

       {/* Additional Tips Section */}
        {(result.waterIntakeRecommendation || result.activityTip || result.nutrientAdvice || result.generalTips) && (
            <Card>
              <CardHeader>
                 <CardTitle className="text-lg font-medium text-primary flex items-center gap-2">
                     <Info size={18} /> Ek Öneriler ve İpuçları
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                 {result.waterIntakeRecommendation && (
                     <div className="flex items-start gap-2">
                         <Droplet size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                         <p><span className="font-medium">Su Tüketimi:</span> {result.waterIntakeRecommendation}</p>
                     </div>
                 )}
                  {result.activityTip && (
                     <div className="flex items-start gap-2">
                         <Dumbbell size={18} className="text-orange-500 mt-0.5 flex-shrink-0"/>
                         <p><span className="font-medium">Aktivite Önerisi:</span> {result.activityTip}</p>
                     </div>
                 )}
                 {result.nutrientAdvice && (
                     <div className="flex items-start gap-2">
                        <Apple size={18} className="text-green-600 mt-0.5 flex-shrink-0"/>
                         <p><span className="font-medium">Besin Tavsiyesi:</span> {result.nutrientAdvice}</p>
                     </div>
                 )}
                 {result.generalTips && (
                     <div className="flex items-start gap-2">
                        <Brain size={18} className="text-purple-500 mt-0.5 flex-shrink-0"/>
                         <p><span className="font-medium">Genel İpuçları:</span> {result.generalTips}</p>
                     </div>
                 )}
              </CardContent>
            </Card>
        )}

    </div>
  );
}