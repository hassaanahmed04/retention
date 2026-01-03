"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DollarSign, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PayoutButtonProps {
  commissionId: string;
  amount: number;
  status: string;
}

export function PayoutButton({ commissionId, amount, status }: PayoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePay = async () => {
    if(!confirm(`Are you sure you want to payout $${amount}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast({ title: "Success", description: "Funds transferred to affiliate." });
      window.location.reload(); 
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "Payout Failed", description: error.message });
    }
    setLoading(false);
  };

  if (status === 'paid') {
      return <span className="flex items-center text-green-600 font-medium text-sm"><Check className="w-4 h-4 mr-1"/> Paid</span>
  }

  return (
    <Button size="sm" onClick={handlePay} disabled={loading} variant="outline">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4 mr-1" />}
      Pay ${amount}
    </Button>
  );
}