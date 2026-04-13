import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import LotteryCard from '@/components/lottery-card';
import ParticipateModal from '@/components/participate-modal';
import type { LotteryData } from '@/types';

type Props = {
    lotteries: LotteryData[];
};

export default function LotteryIndex({ lotteries }: Props) {
    const { auth } = usePage().props;
    const [selectedLottery, setSelectedLottery] = useState<LotteryData | null>(
        null,
    );
    const [modalOpen, setModalOpen] = useState(false);

    const handleParticipate = (lottery: LotteryData) => {
        setSelectedLottery(lottery);
        setModalOpen(true);
    };

    return (
        <>
            <Head title="Сугалаа" />

            <div className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat" style={{ backgroundImage: 'url(/bg.jpg)' }}>
                {/* Header */}
                <header className="border-b bg-card/90 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
                            <img src="/logo.jpg" alt="Атриш Луу" className="h-20 w-20 rounded-full object-cover" />
                            Атриш Луу
                        </Link>
                        <a
                            href="https://www.facebook.com/exactly.frost"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#166FE5]"
                        >
                            <svg viewBox="0 0 36 36" fill="currentColor" className="h-5 w-5">
                                <path d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 34h5.5l.681 1.87Z" />
                                <path fill="#fff" d="M13.651 35.471v-11.97H9.936V18h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18h5.883l-1.008 5.5h-4.867v12.37a18.183 18.183 0 0 1-6.53-.399Z" />
                            </svg>
                            Facebook
                        </a>
                    </div>
                </header>

                {/* Content */}
                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {lotteries.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-lg text-muted-foreground">
                                Одоогоор сугалаа байхгүй байна.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                            {lotteries.map((lottery) => (
                                <LotteryCard
                                    key={lottery.id}
                                    lottery={lottery}
                                    onParticipate={handleParticipate}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <ParticipateModal
                lottery={selectedLottery}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
        </>
    );
}
