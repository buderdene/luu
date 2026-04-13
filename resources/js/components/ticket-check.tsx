import { AlertTriangle, ArrowDownCircle, CalendarDays, Phone, Search, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { LotteryTicketData } from '@/types';

type RemainderEntry = {
    id: number;
    phone: string;
    amount: number;
    transaction_id: number;
    transaction?: {
        id: number;
        amount: number;
        description: string;
        transacted_at: string;
    };
};

type TransactionEntry = {
    id: number;
    amount: number;
    description: string;
    transacted_at: string;
};

type Props = {
    lotteryId: number;
    lotteryImage?: string | null;
    pricePerTicket: number;
};

export default function TicketCheck({ lotteryId, lotteryImage, pricePerTicket }: Props) {
    const [phone, setPhone] = useState('');
    const [tickets, setTickets] = useState<LotteryTicketData[]>([]);
    const [remainders, setRemainders] = useState<RemainderEntry[]>([]);
    const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
    const [remainderTotal, setRemainderTotal] = useState(0);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!/^[6-9]\d{7}$/.test(phone)) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/lotteries/${lotteryId}/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ phone }),
            });

            const data = await response.json();
            setTickets(data.tickets);
            setRemainders(data.remainders ?? []);
            setTransactions(data.transactions ?? []);
            setRemainderTotal(data.remainder_total ?? 0);
            setSearched(true);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('mn-MN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('mn-MN').format(amount) + '₮';
    };

    return (
        <div className="space-y-4">
            <h3 className="text-center text-base font-bold">🎫 Сугалаа шалгах</h3>
            <Input
                type="tel"
                placeholder="Утасны дугаар оруулна уу"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={8}
                className="h-14 text-center text-2xl font-bold tracking-widest placeholder:text-base placeholder:font-normal placeholder:tracking-normal"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
                onClick={handleSearch}
                className="w-full h-12 text-base font-bold"
                size="lg"
                disabled={loading || !/^[6-9]\d{7}$/.test(phone)}
            >
                <Search className="mr-2 h-5 w-5" />
                {loading ? 'Хайж байна...' : 'Сугалаа хайх'}
            </Button>

            {searched && (
                <div className="space-y-3">
                    {tickets.length === 0 && remainders.length === 0 && transactions.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground">
                            Сугалаа олдсонгүй.
                        </p>
                    ) : (
                        <>
                            {tickets.length > 0 && (
                                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                                    <Ticket className="h-5 w-5 text-primary" />
                                    <p className="text-base font-bold text-primary">
                                        Нийт {tickets.length} сугалаа олдлоо
                                    </p>
                                </div>
                            )}
                            <div className="space-y-3">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="relative overflow-hidden rounded-xl border-2 border-primary/20"
                                    >
                                        {/* Ticket header with number */}
                                        <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Ticket className="h-5 w-5 text-primary-foreground" />
                                                <span className="text-sm text-primary-foreground/80">
                                                    Таны сугалааны дугаар.
                                                </span>
                                                <span className="text-lg font-extrabold text-primary-foreground">
                                                    #{ticket.ticket_number}
                                                </span>
                                            </div>
                                            {ticket.transaction && (
                                                <span className="rounded-full bg-white/20 px-3 py-0.5 text-sm font-bold text-primary-foreground">
                                                    {formatAmount(ticket.transaction.amount)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Ticket body */}
                                        <div className="flex bg-card/80 backdrop-blur-sm">
                                            {lotteryImage && (
                                                <div className="w-1/3 flex-shrink-0">
                                                    <img
                                                        src={`/storage/${lotteryImage}`}
                                                        alt="Сугалаа"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 px-4 py-3 space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-muted-foreground">Утас:</span>
                                                    <span className="font-semibold">{ticket.phone}</span>
                                                </div>

                                                {ticket.transaction?.transacted_at && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-muted-foreground">Огноо:</span>
                                                        <span className="font-semibold">
                                                            {formatDate(ticket.transaction.transacted_at)}
                                                        </span>
                                                    </div>
                                                )}

                                                {ticket.transaction?.description && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground">Гүйлгээний утга: </span>
                                                        <span className="font-medium">
                                                            {ticket.transaction.description}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Decorative ticket perforation */}
                                        <div className="absolute top-[52px] -left-2 h-4 w-4 rounded-full bg-background" />
                                        <div className="absolute top-[52px] -right-2 h-4 w-4 rounded-full bg-background" />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Ghost cards for remainders */}
                    {remainders.map((entry) => (
                        <div
                            key={`remainder-${entry.id}`}
                            className="relative overflow-hidden rounded-xl border-2 border-dashed border-yellow-400/60 opacity-60"
                        >
                            {/* Ghost header */}
                            <div className="bg-gradient-to-r from-yellow-500/80 to-yellow-600/60 px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Ticket className="h-5 w-5 text-white/70" />
                                    <span className="text-sm text-white/70">
                                        Сугалаа үүсээгүй
                                    </span>
                                </div>
                                <span className="rounded-full bg-white/20 px-3 py-0.5 text-sm font-bold text-white">
                                    {formatAmount(entry.amount)}
                                </span>
                            </div>

                            {/* Ghost body */}
                            <div className="flex bg-yellow-50/50 dark:bg-yellow-950/20">
                                {lotteryImage && (
                                    <div className="w-1/3 flex-shrink-0 grayscale opacity-40">
                                        <img
                                            src={`/storage/${lotteryImage}`}
                                            alt="Сугалаа"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 px-4 py-3 space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-muted-foreground">Утас:</span>
                                        <span className="font-semibold">{entry.phone}</span>
                                    </div>

                                    {entry.transaction?.transacted_at && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-muted-foreground">Огноо:</span>
                                            <span className="font-semibold">
                                                {formatDate(entry.transaction.transacted_at)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-1.5 rounded-md bg-yellow-100 dark:bg-yellow-950/40 px-3 py-2">
                                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
                                                {formatAmount(pricePerTicket - entry.amount)} дутуу
                                            </p>
                                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                Та {formatAmount(pricePerTicket - entry.amount)} нэмж шилжүүлбэл сугалаа үүснэ.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative ticket perforation */}
                            <div className="absolute top-[52px] -left-2 h-4 w-4 rounded-full bg-background" />
                            <div className="absolute top-[52px] -right-2 h-4 w-4 rounded-full bg-background" />
                        </div>
                    ))}

                    {/* Transactions list */}
                    {transactions.length > 0 && (
                        <div className="rounded-xl border bg-card/80 backdrop-blur-sm overflow-hidden">
                            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2.5 border-b">
                                <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                <p className="text-sm font-bold">
                                    Шилжүүлсэн гүйлгээнүүд ({transactions.length})
                                </p>
                                <span className="ml-auto text-sm font-bold text-green-600">
                                    {formatAmount(transactions.reduce((sum, t) => sum + t.amount, 0))}
                                </span>
                            </div>
                            <div className="divide-y">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold">
                                                {formatAmount(tx.amount)}
                                            </p>
                                            {tx.description && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {tx.description}
                                                </p>
                                            )}
                                        </div>
                                        {tx.transacted_at && (
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDate(tx.transacted_at)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
