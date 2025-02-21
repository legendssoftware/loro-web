export function AlertBanner() {
    return (
        <div className='fixed left-0 right-0 z-50 w-1/3 mx-auto border-t rounded top-4 bg-amber-600 border-amber-700'>
            <div className='container px-2 py-2 mx-auto'>
                <div className='items-center justify-center w-full text-sm font-medium text-center'>
                    <p className='text-xs font-normal uppercase font-body'>Service Disruption</p>
                    <p className='text-[10px] leading-none font-normal mt-0.5 uppercase font-body'>
                        Some features are temporarily unavailable. Sorry for the inconvenience.
                    </p>
                </div>
            </div>
        </div>
    );
}
