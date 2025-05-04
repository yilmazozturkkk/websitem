'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CalendarIcon } from 'lucide-react'; // Added CalendarIcon
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover components
import { Calendar } from "@/components/ui/calendar"; // Import Calendar component
import { format } from "date-fns"; // Import date-fns
import { cn } from "@/lib/utils"; // Import cn for conditional classes

// Updated schema to include planType and startDate
const profileSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır.').max(50, 'İsim en fazla 50 karakter olabilir.'),
  age: z.number({required_error: 'Yaş zorunludur.', invalid_type_error: "Yaş bir sayı olmalıdır."}).int().min(1, 'Yaş pozitif bir sayı olmalıdır.').max(120, 'Yaş çok yüksek görünüyor.'),
  gender: z.enum(['male', 'female'], {required_error: 'Cinsiyet seçimi zorunludur.'}),
  weight: z.number({required_error: 'Kilo zorunludur.', invalid_type_error: "Kilo bir sayı olmalıdır."})
    .positive('Kilo pozitif bir sayı olmalıdır.')
    .min(1, 'Kilo 1 kg\'dan büyük olmalıdır.'),
  height: z.number({required_error: 'Boy zorunludur.', invalid_type_error: "Boy bir sayı olmalıdır."})
    .int("Boy tam sayı olmalıdır.")
    .positive('Boy pozitif bir sayı olmalıdır.')
    .min(50, 'Boy en az 50 cm olmalıdır.')
    .max(280, 'Boy en fazla 280 cm olmalıdır.'),
  activityLevel: z.enum([
    'sedentary',
    'lightly active',
    'moderately active',
    'very active',
  ], {required_error: 'Aktivite seviyesi seçimi zorunludur.'}),
  dietType: z.enum([
    'omnivore',
    'vegetarian',
    'vegan',
    'pescatarian',
    'halal',
    'kosher',
    'gluten-free',
    'diabetic-friendly',
  ], {required_error: 'Diyet Türü seçimi zorunludur.'}),
  allergies: z.string().max(500, 'Alerji açıklaması en fazla 500 karakter olabilir.').optional(), // Allergies remain optional
  goal: z.enum(['lose fat', 'maintain', 'gain muscle'], {required_error: 'Hedef seçimi zorunludur.'}),
  planType: z.enum(['daily', 'weekly'], { required_error: 'Plan türü seçimi zorunludur.' }), // Added planType
  startDate: z.date({ required_error: 'Başlangıç tarihi seçimi zorunludur.' }), // Added startDate as Date
});


// Export the inferred type for use in parent component
export type UserProfileFormData = z.infer<typeof profileSchema>;

export type UserProfileFormProps = {
  onSubmit: (data: UserProfileFormData) => Promise<void>;
  isLoading: boolean;
  // Allow passing default values, converting string date back to Date if needed
  defaultValues?: Partial<Omit<UserProfileFormData, 'startDate'> & { startDate?: string | Date }>;
};

export function UserProfileForm({onSubmit, isLoading, defaultValues}: UserProfileFormProps) {
  // Convert startDate string back to Date object if necessary
  const processedDefaults = defaultValues ? {
      ...defaultValues,
      startDate: defaultValues.startDate ? new Date(defaultValues.startDate) : new Date(),
      allergies: defaultValues.allergies ?? '', // Ensure allergies is never undefined
  } : {
      gender: 'male', // Sensible defaults
      activityLevel: 'sedentary',
      dietType: 'omnivore',
      goal: 'maintain',
      planType: 'daily',
      startDate: new Date(),
      allergies: '',
  };


  const form = useForm<UserProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: processedDefaults,
  });


  function handleSubmit(values: UserProfileFormData) {
    // Format date before submitting if needed, or handle in parent
    onSubmit(values);
  }

   // Watch the startDate field to update the button text
   const watchedStartDate = form.watch("startDate");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İsim</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Örn: Ali"
                  {...field}
                  value={field.value || ''} // Ensure controlled input
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         {/* Age and Gender */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yaş</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="Örn: 30"
                    {...field}
                     // Ensure controlled number input, allow empty string for initial/cleared state
                    value={field.value === undefined || field.value === null || isNaN(field.value) ? '' : String(field.value)}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === '' ? undefined : parseInt(val, 10));
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cinsiyet</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Cinsiyet seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Erkek</SelectItem>
                    <SelectItem value="female">Kadın</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
         {/* Weight and Height */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
           <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilo (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step="0.1"
                    placeholder="Örn: 70.5"
                    {...field}
                     // Ensure controlled number input
                    value={field.value === undefined || field.value === null || isNaN(field.value) ? '' : String(field.value)}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Use parseFloat for weight to allow decimals
                       field.onChange(val === '' ? undefined : parseFloat(val));
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Boy (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={50}
                    max={280}
                    placeholder="Örn: 175"
                    {...field}
                     // Ensure controlled number input
                    value={field.value === undefined || field.value === null || isNaN(field.value) ? '' : String(field.value)}
                     onChange={(e) => {
                       const val = e.target.value;
                       // Use parseInt for height as it's usually integer
                       field.onChange(val === '' ? undefined : parseInt(val, 10));
                     }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         {/* Activity Level */}
        <FormField
          control={form.control}
          name="activityLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aktivite Seviyesi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Aktivite seviyenizi seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sedentary">Hareketsiz (egzersiz yok veya çok az)</SelectItem>
                  <SelectItem value="lightly active">Az Aktif (hafif egzersiz/spor 1-3 gün/hafta)</SelectItem>
                  <SelectItem value="moderately active">Orta Aktif (orta düzey egzersiz/spor 3-5 gün/hafta)</SelectItem>
                  <SelectItem value="very active">Çok Aktif (ağır egzersiz/spor 6-7 gün/hafta)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
         {/* Diet Type */}
        <FormField
          control={form.control}
          name="dietType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diyet Türü</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Diyet türünü seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="omnivore">Hepçil</SelectItem>
                  <SelectItem value="vegetarian">Vejetaryen</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="pescatarian">Pesketaryen</SelectItem>
                  <SelectItem value="halal">Helal</SelectItem>
                  <SelectItem value="kosher">Koşer</SelectItem>
                  <SelectItem value="gluten-free">Glutensiz</SelectItem>
                  <SelectItem value="diabetic-friendly">Diyabetik Dostu</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Allergies */}
        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Alerjiler/İntoleranslar (virgülle ayırın, yoksa boş bırakın)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Örn: Süt, yumurta, fındık"
                  className="resize-none"
                  rows={2}
                  {...field}
                  value={field.value || ''} // Ensure controlled input, default to empty string
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Goal */}
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birincil Hedef</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Birincil hedefinizi seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="lose fat">Yağ Kaybetmek</SelectItem>
                  <SelectItem value="maintain">Kilo Korumak</SelectItem>
                  <SelectItem value="gain muscle">Kas Kazanmak</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Plan Type and Start Date */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="planType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Türü</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Plan türünü seçin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Günlük Plan</SelectItem>
                      <SelectItem value="weekly">Haftalık Plan (7 Gün)</SelectItem>
                      {/* <SelectItem value="monthly">Aylık Plan (30 Gün)</SelectItem> */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2"> {/* Adjusted for alignment */}
                    <FormLabel>Plan Başlangıç Tarihi</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy") // Format for display
                            ) : (
                              <span>Tarih seçin</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                           onSelect={(date) => field.onChange(date)} // Update form state on selection
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) // Disable past dates
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor ve Plan Oluşturuluyor...
            </>
          ) : (
             defaultValues?.name ? 'Profili Güncelle ve Plan Oluştur' : 'Profil Oluştur ve Planı Gör' // Change button text based on context
          )}
        </Button>
      </form>
    </Form>
  );
}