import { Form, Head, router } from '@inertiajs/react';
import { Upload, FileSpreadsheet, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Lottery = {
    id: number;
    name: string;
    total_tickets: number;
    sold_tickets: number;
    tickets_count: number;
    price_per_ticket: number;
};

type Ticket = {
    id: number;
    ticket_number: string;
    phone: string;
    created_at: string;
};

type Transaction = {
    id: number;
    bank_reference: string;
    phone: string;
    amount: number;
    description: string;
    transacted_at: string;
};

type BankEntry = {
    id: number;
    phone: string;
    amount: number;
    ticket_number: number | null;
    created_at: string;
    transaction?: {
        id: number;
        bank_reference: string;
        description: string;
        transacted_at: string;
    };
};

type Props = {
    lottery: Lottery;
    recentTickets: Ticket[];
    recentTransactions: Transaction[];
    bankEntries: BankEntry[];
};

export default function AdminLotteryImport({
    lottery,
    recentTickets,
    recentTransactions,
    bankEntries,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('mn-MN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title={`${lottery.name} - Хуулга импорт`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Хаан банкны хуулга импорт"
                        description={lottery.name}
                    />
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (confirm('Бүх гүйлгээ, сугалаа, банкны бүртгэлийг устгах уу?')) {
                                router.delete(`/admin/lotteries/${lottery.id}/import`);
                            }
                        }}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Бүгдийг арилгах
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Нийт сугалаа</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {lottery.tickets_count}
                                <span className="text-sm font-normal text-muted-foreground">
                                    {' '}
                                    / {lottery.total_tickets}
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Зарагдсан</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {lottery.sold_tickets}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Нэгж үнэ</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {new Intl.NumberFormat('mn-MN').format(
                                    lottery.price_per_ticket,
                                )}
                                ₮
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            Excel хуулга оруулах
                        </CardTitle>
                        <CardDescription>
                            Хаан банкнаас татсан .xlsx, .xls, .csv файлыг
                            сонгоно уу. Утасны дугааргаар сугалаа автоматаар
                            үүснэ.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={`/admin/lotteries/${lottery.id}/import`}
                            method="post"
                            encType="multipart/form-data"
                            options={{ forceFormData: true }}
                        >
                            {({ processing, errors }) => (
                                <div className="flex items-center gap-4">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        name="file"
                                        accept=".xlsx,.xls,.csv"
                                        className="max-w-sm"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {processing
                                            ? 'Импорт хийж байна...'
                                            : 'Импорт хийх'}
                                    </Button>
                                    {errors.file && (
                                        <p className="text-sm text-destructive">
                                            {errors.file}
                                        </p>
                                    )}
                                </div>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                {recentTransactions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Сүүлийн гүйлгээнүүд</CardTitle>
                            <CardDescription>
                                Сүүлд импорт хийсэн 20 гүйлгээ
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Лавлах</TableHead>
                                        <TableHead>Утас</TableHead>
                                        <TableHead>Дүн</TableHead>
                                        <TableHead>Гүйлгээний утга</TableHead>
                                        <TableHead>Огноо</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTransactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-mono text-xs">
                                                {tx.bank_reference}
                                            </TableCell>
                                            <TableCell>{tx.phone}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat(
                                                    'mn-MN',
                                                ).format(tx.amount)}
                                                ₮
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-xs">
                                                {tx.description}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {tx.transacted_at ? formatDate(tx.transacted_at) : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Bank Entries */}
                {bankEntries.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Сугалааны банк</CardTitle>
                            <CardDescription>
                                Гүйлгээг {new Intl.NumberFormat('mn-MN').format(lottery.price_per_ticket)}₮ тутамд хувааж сугалаа үүсгэсэн
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Сугалаа</TableHead>
                                        <TableHead>Утас</TableHead>
                                        <TableHead>Дүн</TableHead>
                                        <TableHead>Гүйлгээний утга</TableHead>
                                        <TableHead>Огноо</TableHead>
                                        <TableHead>Төлөв</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bankEntries.map((entry) => (
                                        <TableRow key={entry.id} className={!entry.ticket_number ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}>
                                            <TableCell className="font-mono font-bold">
                                                {entry.ticket_number ? (
                                                    <span className="text-primary">#{entry.ticket_number}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{entry.phone}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('mn-MN').format(entry.amount)}₮
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate text-xs">
                                                {entry.transaction?.description}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {entry.transaction?.transacted_at ? formatDate(entry.transaction.transacted_at) : '—'}
                                            </TableCell>
                                            <TableCell>
                                                {entry.ticket_number ? (
                                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Сугалаа үүссэн
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        Дутуу ({new Intl.NumberFormat('mn-MN').format(lottery.price_per_ticket - entry.amount)}₮)
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Tickets */}
                {recentTickets.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Сүүлийн сугалаанууд</CardTitle>
                            <CardDescription>
                                Сүүлд үүссэн 50 сугалаа
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Дугаар</TableHead>
                                        <TableHead>Утас</TableHead>
                                        <TableHead>Үүссэн</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTickets.map((ticket) => (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-mono font-bold">
                                                #{ticket.ticket_number}
                                            </TableCell>
                                            <TableCell>
                                                {ticket.phone}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {ticket.created_at}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

AdminLotteryImport.layout = {
    breadcrumbs: [
        {
            title: 'Сугалаа удирдах',
            href: '/admin/lotteries',
        },
        {
            title: 'Хуулга импорт',
        },
    ],
};
