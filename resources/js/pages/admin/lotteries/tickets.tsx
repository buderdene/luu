import { Head, Link, router } from '@inertiajs/react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
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
    tickets_count: number;
};

type Ticket = {
    id: number;
    ticket_number: string;
    phone: string;
    created_at: string;
};

type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    lottery: Lottery;
    tickets: PaginatedData<Ticket>;
    filters: {
        search: string;
    };
};

export default function AdminLotteryTickets({ lottery, tickets, filters }: Props) {
    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    const navigate = useCallback((params: Record<string, string | undefined>) => {
        router.get(
            `/admin/lotteries/${lottery.id}/tickets`,
            params,
            { preserveState: true, replace: true },
        );
    }, [lottery.id]);

    const handleSearch = useCallback((value: string) => {
        setSearchValue(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            navigate({ search: value || undefined });
        }, 300);
    }, [navigate]);

    const PaginationControls = ({ paginator }: { paginator: PaginatedData<unknown> }) => {
        if (paginator.last_page <= 1) return null;
        const current = Object.fromEntries(new URLSearchParams(window.location.search));
        return (
            <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                    {paginator.from}–{paginator.to} / {paginator.total}
                </p>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={paginator.current_page <= 1}
                        onClick={() => router.get(`/admin/lotteries/${lottery.id}/tickets`, { ...current, page: String(paginator.current_page - 1) }, { preserveState: true, replace: true })}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-2 text-sm">{paginator.current_page} / {paginator.last_page}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={paginator.current_page >= paginator.last_page}
                        onClick={() => router.get(`/admin/lotteries/${lottery.id}/tickets`, { ...current, page: String(paginator.current_page + 1) }, { preserveState: true, replace: true })}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title={`${lottery.name} - Сугалаанууд`} />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Сугалаанууд"
                    description={lottery.name}
                />

                {/* Tab nav */}
                <div className="flex gap-1 border-b">
                    <Link
                        href={`/admin/lotteries/${lottery.id}/import`}
                        className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        Гүйлгээ
                    </Link>
                    <Link
                        href={`/admin/lotteries/${lottery.id}/bank`}
                        className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                        Сугалааны банк
                    </Link>
                    <Link
                        href={`/admin/lotteries/${lottery.id}/tickets`}
                        className="border-b-2 border-primary px-4 py-2 text-sm font-medium text-foreground"
                    >
                        Сугалаанууд
                    </Link>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Утас, сугалааны дугаар..."
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Сугалаанууд</CardTitle>
                        <CardDescription>
                            Нийт {tickets.total} сугалаа
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
                                {tickets.data.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-mono font-bold">
                                            #{ticket.ticket_number}
                                        </TableCell>
                                        <TableCell>{ticket.phone}</TableCell>
                                        <TableCell className="text-xs">
                                            {ticket.created_at?.replace('T', ' ').replace(/\.\d+Z$/, '')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <PaginationControls paginator={tickets} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminLotteryTickets.layout = {
    breadcrumbs: [
        { title: 'Сугалаа удирдах', href: '/admin/lotteries' },
        { title: 'Сугалаанууд' },
    ],
};
