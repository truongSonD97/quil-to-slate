import dynamic from 'next/dynamic';

const SlateComponent = dynamic(() => import('./Slate'), { ssr: false });

export default function SlatePage() {
    return <main className='bg-white text-black h-screen'>
        <SlateComponent />
    </main>
}