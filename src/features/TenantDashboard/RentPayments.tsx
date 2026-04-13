"use client"

import { useState } from "react";
import NavBar from '@/components/general/NavBar';
import { 
    Download, 
    CreditCard, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    ArrowUpRight,
    FileText,
    ExternalLink,
    Send,
    Plus
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { downloadDocument } from "@/services/useFileServiceApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { useUIStore } from "@/stores/ui-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const proofSchema = z.object({
    paymentId: z.string().min(1, "Payment ID is required"),
    paidDate: z.string().min(1, "Date is required"),
    paymentMethod: z.enum(['bank_transfer', 'cash', 'check', 'card', 'online']),
    transactionRef: z.string().min(3, "Reference is required"),
    notes: z.string().optional(),
});

type ProofFormValues = z.infer<typeof proofSchema>;

function printInvoice(payment: any) {
    const win = window.open('', '_blank');
    if (!win) return;
    const amount = Number(payment.amountPaid || payment.amount).toLocaleString();
    const dueDate = new Date(payment.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    const ref = payment.transactionRef || payment.id?.slice(0, 10) || 'N/A';
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Invoice</title>
  <style>
    body { font-family: sans-serif; padding: 40px; color: #111; }
    h1 { font-size: 28px; margin-bottom: 4px; }
    .label { color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .value { font-size: 16px; font-weight: bold; margin-bottom: 16px; }
    .amount { font-size: 36px; font-weight: 900; margin: 24px 0; }
    hr { border: none; border-top: 1px solid #eee; margin: 24px 0; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Rent Invoice</h1>
  <hr/>
  <div class="label">Amount Due</div>
  <div class="amount">₦${amount}</div>
  <div class="label">Due Date</div>
  <div class="value">${dueDate}</div>
  <div class="label">Reference</div>
  <div class="value">#${ref}</div>
  <div class="label">Status</div>
  <div class="value">${payment.status?.toUpperCase() || 'PENDING'}</div>
  <hr/>
  <p style="color:#aaa;font-size:12px;">Generated on ${new Date().toLocaleString()}</p>
</body>
</html>`);
    win.document.close();
    win.print();
}

function printHistory(history: any[]) {
    const win = window.open('', '_blank');
    if (!win) return;
    const rows = (history || []).map(p => `
      <tr>
        <td>${new Date(p.paidDate || p.dueDate).toLocaleDateString()}</td>
        <td>#${p.transactionRef?.slice(0, 10) || 'DIRECT'}</td>
        <td>${p.paymentMethod?.replace('_', ' ') || 'Pending'}</td>
        <td>₦${Number(p.amountPaid || p.amount).toLocaleString()}</td>
        <td>${p.status?.toUpperCase()}</td>
      </tr>`).join('');
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Payment History</title>
  <style>
    body { font-family: sans-serif; padding: 40px; color: #111; }
    h1 { font-size: 24px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; padding: 8px 12px; border-bottom: 2px solid #eee; }
    td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Transaction History</h1>
  <table>
    <thead><tr><th>Date</th><th>Reference</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="color:#aaa;font-size:12px;margin-top:24px;">Generated on ${new Date().toLocaleString()}</p>
</body>
</html>`);
    win.document.close();
    win.print();
}

const RentPayments = () => {
    const { openModal, closeModal } = useUIStore();
    const queryClient = useQueryClient();
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    // Fetch payments
    const { data: payments, isLoading } = useQuery({
        queryKey: ['tenant-payments'],
        queryFn: () => apiClient.get<any[]>('/payments'),
    });

    const upcomingPayment = payments?.find(p => p.status === 'pending' || p.status === 'overdue');
    const paymentHistory = payments?.filter(p => p.status === 'paid' || p.status === 'verifying');

    const form = useForm<ProofFormValues>({
        resolver: zodResolver(proofSchema),
        defaultValues: {
            paymentId: '',
            paidDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'bank_transfer',
            transactionRef: '',
            notes: '',
        },
    });

    const mutation = useMutation({
        mutationFn: (values: ProofFormValues) => 
            apiClient.patch(`/payments/${values.paymentId}/submit-proof`, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-payments'] });
            toast.success('Payment proof submitted successfully!');
            closeModal();
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to submit proof');
        }
    });

    const handleOpenProof = (payment: any) => {
        setSelectedPayment(payment);
        form.setValue('paymentId', payment.id);
        openModal('submitPaymentProof');
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <>
            <NavBar title="Payments" subtitle="Manage your rent payments and transaction history" />

            {/* Upcoming Payment Banner */}
            {upcomingPayment ? (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-indigo-100 shadow-xl shadow-indigo-50/50 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
                                {upcomingPayment.status === 'overdue' ? 'Overdue' : 'Upcoming Payment'}
                            </span>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-1 flex items-start">
                            <span className="text-lg mt-1 mr-1 opacity-40">₦</span>
                            {Number(upcomingPayment.amount).toLocaleString()}
                        </h2>
                        <p className="text-gray-400 font-medium">Due on {new Date(upcomingPayment.dueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3 relative">
                        <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-gray-100 hover:bg-gray-50" onClick={() => printInvoice(upcomingPayment)}>
                            Download Invoice
                        </Button>
                        <Button 
                            onClick={() => handleOpenProof(upcomingPayment)}
                            className="h-14 px-10 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                        >
                            Record Payment
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border border-green-100 rounded-[2rem] p-8 flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-green-900">You're all caught up!</h3>
                        <p className="text-green-700/70 text-sm font-medium">No pending or overdue rent payments found for your account.</p>
                    </div>
                </div>
            )}

            {/* Payment History Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                    <Button variant="ghost" className="text-indigo-600 font-bold rounded-xl h-10 px-4" onClick={() => printHistory(paymentHistory ?? [])}>Export PDF</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-left text-[10px] uppercase font-bold text-gray-400 tracking-widest">Date</th>
                                <th className="px-8 py-4 text-left text-[10px] uppercase font-bold text-gray-400 tracking-widest">Reference</th>
                                <th className="px-8 py-4 text-left text-[10px] uppercase font-bold text-gray-400 tracking-widest">Method</th>
                                <th className="px-8 py-4 text-left text-[10px] uppercase font-bold text-gray-400 tracking-widest">Amount</th>
                                <th className="px-8 py-4 text-left text-[10px] uppercase font-bold text-gray-400 tracking-widest">Status</th>
                                <th className="px-8 py-4 text-right text-[10px] uppercase font-bold text-gray-400 tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paymentHistory?.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{new Date(p.paidDate || p.dueDate).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-gray-400 font-medium">Period: {p.periodYear}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-mono text-gray-400">#{p.transactionRef?.slice(0, 10) || 'DIRECT'}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                                            <span className="text-sm font-medium text-gray-700 capitalize">{p.paymentMethod?.replace('_', ' ') || 'Pending'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-sm font-black text-gray-900">₦{Number(p.amountPaid || p.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                                            p.status === 'paid' 
                                            ? 'bg-green-50 text-green-600 border-green-100' 
                                            : 'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-medium">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-800 transition-colors text-sm font-bold flex items-center gap-1.5 ml-auto"
                                            onClick={() => {
                                                if (p.transactionDocument) {
                                                    downloadDocument(p.transactionDocument, 'receipt.pdf').catch(() =>
                                                        toast.error('Failed to download receipt')
                                                    );
                                                } else {
                                                    printInvoice(p);
                                                }
                                            }}
                                        >
                                            <Download className="w-4 h-4" />
                                            Receipt
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!paymentHistory || paymentHistory.length === 0) && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <FileText className="w-12 h-12 mb-4" />
                                            <p className="font-bold">No payment records found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Submit Proof Modal */}
            <Modal
                type="submitPaymentProof"
                title="Record Your Payment"
                description={`Submit proof of payment for ${selectedPayment?.lease?.property?.addressLine1 || 'your residence'}`}
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="paidDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Payment</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="h-12 rounded-xl bg-gray-50 border-gray-100" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Method</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-gray-100">
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-gray-100">
                                                <SelectItem value="bank_transfer" className="rounded-lg">Bank Transfer</SelectItem>
                                                <SelectItem value="online" className="rounded-lg">Online Card</SelectItem>
                                                <SelectItem value="cash" className="rounded-lg">Cash Deposit</SelectItem>
                                                <SelectItem value="check" className="rounded-lg">Check</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="transactionRef"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Reference / ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. TRN-93839281" {...field} className="h-12 rounded-xl bg-gray-50 border-gray-100 font-mono" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optional Notes</FormLabel>
                                    <FormControl>
                                        <textarea 
                                            {...field} 
                                            className="w-full min-h-[100px] rounded-2xl bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Any additional info for your landlord..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                            <Button type="button" variant="ghost" className="rounded-xl h-12 px-6 font-bold" onClick={closeModal}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={mutation.isPending}
                                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 px-10 font-black shadow-lg shadow-indigo-100 flex gap-3"
                            >
                                {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        Submit for Verification
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </Modal>
        </>
    );
};

export default RentPayments;