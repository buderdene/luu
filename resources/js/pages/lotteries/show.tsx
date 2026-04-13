import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import ParticipateModal from '@/components/participate-modal';
import TicketCheck from '@/components/ticket-check';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { LotteryData } from '@/types';

type Props = {
    lottery: LotteryData;
};

export default function LotteryShow({ lottery }: Props) {
    const [modalOpen, setModalOpen] = useState(false);

    const formattedPrice = new Intl.NumberFormat('mn-MN').format(
        lottery.price_per_ticket,
    );

    return (
        <>
            <Head title={lottery.name} />

            <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat" style={{ backgroundImage: 'url(/bg.jpg)' }}>
                {/* Header */}
                <header className="border-b bg-card/90 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <Link
                            href="/"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-2xl font-bold text-primary"
                        >
                            <img src="/logo.jpg" alt="Атриш Луу" className="h-9 w-9 rounded-full object-cover" />
                            Атриш Луу
                        </Link>
                        <div className="ml-auto">
                            <a
                                href="https://www.facebook.com/exactly.frost"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-lg bg-[#1877F2] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#166FE5]"
                            >
                                <svg viewBox="0 0 36 36" fill="currentColor" className="h-5 w-5">
                                    <path d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 34h5.5l.681 1.87Z" />
                                    <path fill="#fff" d="M13.651 35.471v-11.97H9.936V18h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18h5.883l-1.008 5.5h-4.867v12.37a18.183 18.183 0 0 1-6.53-.399Z" />
                                </svg>
                                Facebook
                            </a>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-5">
                        {/* Left Column - Image & Details (3/5) */}
                        <div className="space-y-6 lg:col-span-3">
                            <Card className="overflow-hidden">
                                <div className="relative">
                                    {lottery.image ? (
                                        <img
                                            src={`/storage/${lottery.image}`}
                                            alt={lottery.name}
                                            className="aspect-video w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex aspect-video w-full items-center justify-center bg-muted">
                                            <span className="text-6xl">🎰</span>
                                        </div>
                                    )}

                                    <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
                                        {formattedPrice} ₮
                                    </span>

                                    <div className="absolute left-3 bottom-3 flex items-center gap-2">
                                        {!lottery.is_finished && (
                                            <span className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                                                Дуусаагүй байгаа
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <CardContent className="p-5">
                                    <h1 className="text-2xl font-bold">{lottery.name}</h1>
                                </CardContent>
                            </Card>

                            {/* Progress */}
                            <Card>
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-end justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Сугалааны хувь</span>
                                        <span className="text-3xl font-extrabold text-primary">
                                            {new Intl.NumberFormat('mn-MN').format(lottery.sold_tickets)}
                                            <span className="text-lg font-semibold text-muted-foreground">
                                                /{new Intl.NumberFormat('mn-MN').format(lottery.total_tickets)}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="relative h-5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                                            style={{ width: `${Math.min(lottery.completion, 100)}%` }}
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary-foreground mix-blend-difference">
                                            {lottery.completion}%
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Details */}
                            <Card>
                                <CardContent className="p-6">
                                    <dl className="grid gap-4 sm:grid-cols-2">
                                        {lottery.location && (
                                            <div>
                                                <dt className="text-sm font-bold text-foreground">
                                                    Байршил:
                                                </dt>
                                                <dd className="text-sm text-muted-foreground">
                                                    {lottery.location}
                                                </dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt className="text-sm font-bold text-foreground">
                                                Эхлэх огноо:
                                            </dt>
                                            <dd className="text-sm text-muted-foreground">
                                                {lottery.starts_at}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-bold text-foreground">
                                                Азтанг тодруулах огноо:
                                            </dt>
                                            <dd className="text-sm text-muted-foreground">
                                                {lottery.draws_at}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-bold text-foreground">
                                                Нэгж сугалааны үнэ:
                                            </dt>
                                            <dd className="text-sm text-muted-foreground">
                                                {formattedPrice} төгрөг
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-bold text-foreground">
                                                Нийт сугалааны тоо:
                                            </dt>
                                            <dd className="text-sm text-muted-foreground">
                                                {new Intl.NumberFormat(
                                                    'mn-MN',
                                                ).format(
                                                    lottery.total_tickets,
                                                )}{' '}
                                                ширхэг
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-bold text-foreground">
                                                Зарагдсан:
                                            </dt>
                                            <dd className="text-sm text-muted-foreground">
                                                {new Intl.NumberFormat(
                                                    'mn-MN',
                                                ).format(
                                                    lottery.sold_tickets,
                                                )}{' '}
                                                ширхэг ({lottery.completion}%)
                                            </dd>
                                        </div>
                                    </dl>
                                </CardContent>
                            </Card>

                            {lottery.description && (
                                <Card className="overflow-hidden border-0 p-0">
                                    {/* Poster header */}
                                    <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-6 py-5 text-center">
                                        <p className="text-sm font-medium text-primary-foreground/70 uppercase tracking-widest">Атриш Луу</p>
                                        <h2 className="text-2xl font-extrabold text-primary-foreground mt-1">
                                            🏆 Сугалааны шагналын сангийн мэдээлэл
                                        </h2>
                                    </div>

                                    <div className="p-5 space-y-3 bg-gradient-to-b from-card to-muted/30">
                                        {/* Grand Prize */}
                                        <div className="relative overflow-hidden rounded-xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 p-5">
                                            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-extrabold px-3 py-1 rounded-bl-lg">
                                                1-р АЗТАН
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <span className="text-5xl">🚗</span>
                                                <div>
                                                    <h3 className="text-xl font-extrabold text-foreground">
                                                        Toyota Harrier Hybrid
                                                    </h3>
                                                    <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                                                        Төмөр хүлэг (машин)
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {['2020-2026 он', '360° камер', '4WD', '4 шинэ дугуй', 'Суудал халдаг', 'Hybrid Full'].map((tag) => (
                                                            <span key={tag} className="rounded-full bg-yellow-100 dark:bg-yellow-900/40 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2nd, 3rd, 4th prizes */}
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div className="rounded-xl border bg-card p-4 text-center space-y-2">
                                                <span className="inline-block rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-bold text-muted-foreground">2-р АЗТАН</span>
                                                <p className="text-4xl">🐎</p>
                                                <p className="text-sm font-bold">Хурдан хүлэг</p>
                                                <p className="text-xs text-muted-foreground">(Адуу)</p>
                                            </div>
                                            <div className="rounded-xl border bg-card p-4 text-center space-y-2">
                                                <span className="inline-block rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-bold text-muted-foreground">3-р АЗТАН</span>
                                                <p className="text-4xl">📱</p>
                                                <p className="text-sm font-bold">iPhone 17 Pro Max</p>
                                            </div>
                                            <div className="rounded-xl border bg-card p-4 text-center space-y-2">
                                                <span className="inline-block rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-bold text-muted-foreground">4-р АЗТАН</span>
                                                <p className="text-4xl">🐏</p>
                                                <p className="text-sm font-bold">Бүтэн бэлдсэн хонь</p>
                                            </div>
                                        </div>

                                        {/* Cash prizes */}
                                        <div className="rounded-xl border-2 border-green-400 bg-green-50 dark:bg-green-950/20 p-4 text-center">
                                            <p className="text-3xl mb-1">💰</p>
                                            <p className="text-lg font-extrabold text-green-700 dark:text-green-400">
                                                12 хүн × 500,000₮
                                            </p>
                                            <p className="text-sm text-green-600 dark:text-green-500">
                                                Хагас сая төгрөгийн эзэн болно!
                                            </p>
                                        </div>

                                        {/* Event info */}
                                        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 p-4 space-y-2 text-center">
                                            <p className="text-2xl">🎪</p>
                                            <p className="text-base font-bold text-blue-800 dark:text-blue-300">
                                                6 сарын 1-нд Ижий Бантантай
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                                Цайгаа <span className="font-bold">ҮНЭГҮЙ</span> тоглоомтой гэр бүл хүүхдийн зусландаа хийхээр боллоо.
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Хүүхдийн хүрээлэн бүтээн байгуулах их ажил байгаа 🙏
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Actions (2/5) */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Bank info */}
                            {(lottery.bank_account || lottery.bank_name) && (
                                <Card className="overflow-hidden border-2 border-[#174822] p-0">
                                    <div className="bg-[#174822] px-6 py-5 flex items-center gap-4">
                                        <img
                                            alt="Хаан банк"
                                            className="size-10 rounded-lg bg-white/10 p-0.5"
                                            src="/bank/khanbank.svg"
                                        />
                                        <div>
                                            <p className="text-emerald-200 text-sm">
                                                KHAN BANK
                                            </p>
                                        </div>
                                    </div>
                                    <CardContent className="p-5 space-y-4">
                                        <div className="rounded-lg bg-[#174822]/5 p-4 text-center">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                                Дансны дугаар
                                            </p>
                                            <p className="font-mono text-xl font-extrabold tracking-wider text-[#174822]">
                                                IBAN:53000500 {lottery.bank_account}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 p-3">
                                            <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
                                                ⚠️ Гүйлгээний утга дээр утасны дугаараа заавал бичнэ үү!
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Participate button */}
                            <Button
                                className="w-full text-lg py-6"
                                size="lg"
                                onClick={() => setModalOpen(true)}
                            >
                                <ArrowRight className="mr-2 h-5 w-5" />
                                Оролцох
                            </Button>

                            {/* Ticket check */}
                            <Card>
                                <CardContent className="p-5">
                                    <TicketCheck lotteryId={lottery.id} lotteryImage={lottery.image} pricePerTicket={lottery.price_per_ticket} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>

            <ParticipateModal
                lottery={lottery}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
        </>
    );
}
