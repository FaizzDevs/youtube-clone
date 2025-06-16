import { HistoryVideosSection } from "../sections/history-videos-section"

// MENAMPILKAN TAMPILAN UTAMA HISTORY
export const HistoryView = () => {
    return (
        <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
            <div>
                <h1 className="text-2xl font-bold">History</h1>
                <p className="text-xs text-muted-foreground">Video yang telah kamu tonton</p>
            </div>
            <HistoryVideosSection />
        </div>
    )
}