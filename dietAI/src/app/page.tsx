'use client';

import type { CalculateMealNutritionOutput } from '@/ai/flows/nutrient-calculation';
import type { PersonalizedRecommendationsOutput, UserProfile } from '@/ai/flows/personalized-recommendations';
import { MealAnalysisForm } from '@/components/MealAnalysisForm';
import { MealAnalysisResults } from '@/components/MealAnalysisResults';
import { UserProfileForm, UserProfileFormData } from '@/components/UserProfileForm'; // Import UserProfileFormData
import { UserProfileResults } from '@/components/UserProfileResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Leaf, Loader2, User, Edit, Trash2 } from 'lucide-react'; // Added Edit, Trash2 icons
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns'; // Import format for date

export default function Home() {
  const [browserLanguage, setBrowserLanguage] = useState<string>('tr-TR'); // Default to Turkish
  const [mealAnalysisResult, setMealAnalysisResult] =
    useState<CalculateMealNutritionOutput | null>(null);
  const [recommendationResult, setRecommendationResult] =
    useState<PersonalizedRecommendationsOutput | null>(null);
  const [isMealAnalysisLoading, setIsMealAnalysisLoading] = useState(false);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // State to store user profile
  const [isEditingProfile, setIsEditingProfile] = useState(false); // State to manage editing mode
  const { toast } = useToast();

  useEffect(() => {
    // Detect browser language on client side, but keep Turkish as default
    if (typeof window !== 'undefined' && window.navigator) {
       // Keep Turkish default, or uncomment below to detect browser language
      // setBrowserLanguage(navigator.language || 'tr-TR');
    }
  }, []);

  // Load user profile from localStorage on component mount
  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile) as UserProfile;
        // Validate crucial fields
        if (parsedProfile && parsedProfile.name && parsedProfile.age && parsedProfile.gender && parsedProfile.height && parsedProfile.weight && parsedProfile.activityLevel && parsedProfile.dietType && parsedProfile.goal && parsedProfile.planType && parsedProfile.startDate) {
           setUserProfile(parsedProfile);
           setIsEditingProfile(false); // Ensure not in editing mode when loaded
        } else {
            console.warn("Stored profile is incomplete or missing new fields, removing.");
            localStorage.removeItem('userProfile');
        }
      } catch (error) {
          console.error("Failed to parse stored profile:", error);
          localStorage.removeItem('userProfile');
      }
    } else {
        setIsEditingProfile(true); // If no profile, start in editing/creation mode
    }
  }, []);

  const handleMealAnalysisSubmit = async (mealDescription: string) => {
    setIsMealAnalysisLoading(true);
    setMealAnalysisResult(null); // Clear previous results
    try {
      // Dynamically import the server action only when needed
      const { calculateMealNutrition } = await import('@/ai/flows/nutrient-calculation');
      const result = await calculateMealNutrition({
        mealDescription,
        language: browserLanguage,
      });
      if (!result) {
         throw new Error('Öğün analizi sonucu boş döndü.');
      }
      setMealAnalysisResult(result);
    } catch (error) {
      console.error('Öğün Analizi Hatası:', error);
      toast({
        title: 'Öğün Analiz Hatası',
        description: `Öğün analizi yapılamadı. Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata.'}`,
        variant: 'destructive',
      });
    } finally {
      setIsMealAnalysisLoading(false);
    }
  };

  // Updated handleProfileSubmit to use UserProfileFormData
  const handleProfileSubmit = async (formData: UserProfileFormData) => {
     // Ensure all required fields are present before submitting
     if (!formData.age || !formData.height || !formData.weight || !formData.planType || !formData.startDate) {
        console.error('Profile data is missing required fields (age, height, weight, planType, startDate).');
        toast({
          title: 'Eksik Bilgi',
          description: 'Lütfen tüm zorunlu alanları (Yaş, Boy, Kilo, Plan Türü, Başlangıç Tarihi) doldurduğunuzdan emin olun.',
          variant: 'destructive',
        });
        return; // Prevent submission
      }

    setIsRecommendationLoading(true);
    setRecommendationResult(null); // Clear previous results

    // Construct the full UserProfile object
    const completeProfile: UserProfile = {
        ...formData,
        allergies: formData.allergies || '', // Ensure allergies is a string
        browserLanguage: browserLanguage,
        startDate: format(formData.startDate, 'yyyy-MM-dd'), // Format date correctly
    };


    try {
      // Dynamically import the server action only when needed
      const { getPersonalizedRecommendations } = await import('@/ai/flows/personalized-recommendations');

      // Save complete profile data to localStorage
      localStorage.setItem('userProfile', JSON.stringify(completeProfile));
      setUserProfile(completeProfile); // Update state with new profile
      setIsEditingProfile(false); // Exit editing mode

      console.log("Sending profile data to AI:", completeProfile);
      const result = await getPersonalizedRecommendations(completeProfile);

       if (!result) {
         console.error('Öneri sonucu boş döndü.');
         throw new Error('Öneri sonucu AI modelinden boş döndü.');
      }
       if (!result.mealPlan || result.mealPlan.length === 0) {
           console.error('Öneri sonucu eksik veya boş öğün planı içeriyor:', result);
           throw new Error('AI modeli eksik veya boş bir öğün planı oluşturdu.');
       }

      console.log("Received recommendation result:", result);
      setRecommendationResult(result);
       toast({
           title: 'Önerileriniz Hazır!',
           description: `${formData.name}, kişiselleştirilmiş ${formData.planType === 'daily' ? 'günlük' : 'haftalık'} planınız oluşturuldu.`,
       });
    } catch (error) {
      console.error('Kişiselleştirilmiş Öneri Hatası:', error);
      toast({
        title: 'Öneri Alma Hatası',
        description: `Öneriler oluşturulamadı. Hata: ${error instanceof Error ? error.message : 'Bilinmeyen bir sorun oluştu.'}`,
        variant: 'destructive',
      });
       setRecommendationResult(null); // Ensure result is null on error
    } finally {
      setIsRecommendationLoading(false);
    }
  };

    // Function to clear profile and results, then enter editing mode
    const handleResetProfile = () => {
        localStorage.removeItem('userProfile');
        setUserProfile(null);
        setRecommendationResult(null);
        setIsEditingProfile(true); // Enter editing mode after reset
        toast({
          title: 'Profil Sıfırlandı',
          description: 'Yeni bir profil oluşturabilirsiniz.',
        });
      };

    // Function to enter editing mode without clearing data
    const handleEditProfile = () => {
        setIsEditingProfile(true);
        setRecommendationResult(null); // Clear results when editing starts
         toast({
          title: 'Profil Düzenleme',
          description: 'Profil bilgilerinizi güncelleyebilirsiniz.',
        });
    };

     // Function to cancel editing and revert to showing profile/results (if profile exists)
    const handleCancelEdit = () => {
         if (userProfile) { // Only cancel if a profile actually exists
             setIsEditingProfile(false);
             // Optionally, regenerate recommendations if needed, or just show the profile summary
         }
     };


  return (
    <main className="container mx-auto min-h-screen p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">DietAI</h1>
        <p className="text-lg text-muted-foreground">
          Yapay Zeka Destekli Akıllı Diyet Asistanınız
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Meal Analysis Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-accent">
              <Leaf size={24} /> Öğün Analizi (Opsiyonel)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MealAnalysisForm
              onSubmit={handleMealAnalysisSubmit}
              isLoading={isMealAnalysisLoading}
            />
             {(isMealAnalysisLoading || mealAnalysisResult) && <Separator className="my-6" />}
             {/* Render results or loading state */}
             <MealAnalysisResults
                result={mealAnalysisResult}
                isLoading={isMealAnalysisLoading}
             />
          </CardContent>
        </Card>

        {/* Personalized Recommendations Section */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-x-2">
             <CardTitle className="flex items-center gap-2 text-2xl text-accent">
               <User size={24} /> Profil ve Planlama
             </CardTitle>
             {/* Show Edit/Reset Buttons only if NOT currently editing and a profile exists */}
             {!isEditingProfile && userProfile && (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleEditProfile} title="Profili Düzenle">
                        <Edit size={16} />
                        <span className="sr-only">Profili Düzenle</span>
                    </Button>
                     <Button variant="destructive" size="sm" onClick={handleResetProfile} title="Profili Sıfırla">
                        <Trash2 size={16} />
                         <span className="sr-only">Profili Sıfırla</span>
                    </Button>
                </div>
             )}
           </CardHeader>
          <CardContent className="space-y-4">
            {isEditingProfile || !userProfile ? (
                 <>
                    <UserProfileForm // Show form if editing or no profile
                      onSubmit={handleProfileSubmit}
                      isLoading={isRecommendationLoading}
                      defaultValues={userProfile || { allergies: '', planType: 'daily', startDate: new Date() }} // Pass existing profile or defaults
                    />
                    {/* Show Cancel button only if editing an EXISTING profile */}
                    {isEditingProfile && userProfile && (
                        <Button variant="outline" onClick={handleCancelEdit} className="w-full mt-2">
                            Düzenlemeyi İptal Et
                        </Button>
                    )}
                 </>
            ) : (
                 // Profile exists and not editing: Show results or Regenerate button
                <>
                  {(isRecommendationLoading || recommendationResult) ? (
                      <UserProfileResults
                        result={recommendationResult}
                        isLoading={isRecommendationLoading}
                        userProfile={userProfile}
                         onRegenerate={() => handleProfileSubmit(userProfile)} // Pass regenerate function
                         // Add Export/Print functionality here later
                      />
                  ) : (
                     // Profile exists, not editing, no results yet -> Show Regenerate Button
                     <div className="text-center space-y-4 pt-4">
                         <p className="text-muted-foreground">Merhaba {userProfile.name}! Profiliniz kaydedildi. Planınızı oluşturmak için butona tıklayın.</p>
                         <Button
                            onClick={() => handleProfileSubmit(userProfile)} // Re-submit existing profile
                            disabled={isRecommendationLoading}
                            className="w-full bg-accent hover:bg-accent/90"
                         >
                           {isRecommendationLoading ? (
                               <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Oluşturuluyor...
                               </>
                             ) : (
                               `${userProfile.planType === 'daily' ? 'Günlük' : 'Haftalık'} Planı Oluştur`
                            )}
                         </Button>
                     </div>
                  )}
                </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}