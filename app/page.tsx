import dynamic from 'next/dynamic';

const QuillComponent = dynamic(() => import('./QuillEditor'), { ssr: false });


function App() {


  return <div className='bg-white text-black min-h-screen'>
    <QuillComponent />
  </div>;
}
export default App
