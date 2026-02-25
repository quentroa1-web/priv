export function UserCardSkeleton() {
    return (
        <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 shimmer" />
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded-lg shimmer" />
                    <div className="h-4 w-10 bg-gray-100 rounded-lg shimmer" />
                </div>
                <div className="h-3 w-32 bg-gray-50 rounded-lg shimmer" />
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                    <div className="h-4 w-16 bg-gray-100 rounded-lg shimmer" />
                    <div className="h-5 w-5 bg-gray-200 rounded-full shimmer" />
                </div>
            </div>
        </div>
    );
}
