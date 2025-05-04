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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  mealDescription: z
    .string()
    .min(10, { message: 'Lütfen öğününüzü en az 10 karakterle tanımlayın.' })
    .max(500, { message: 'Öğün açıklaması 500 karakteri geçemez.' }),
});

type MealAnalysisFormProps = {
  onSubmit: (mealDescription: string) => Promise<void>;
  isLoading: boolean;
};

export function MealAnalysisForm({ onSubmit, isLoading }: MealAnalysisFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealDescription: '',
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values.mealDescription);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="mealDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Öğününüzü Tanımlayın</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Örn: 'Bir kase mercimek çorbası, bir dilim tam buğday ekmeği ve zeytinyağlı salata.'"
                  className="resize-none"
                  rows={4}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analiz Ediliyor...
            </>
          ) : (
            'Öğünü Analiz Et'
          )}
        </Button>
      </form>
    </Form>
  );
}
