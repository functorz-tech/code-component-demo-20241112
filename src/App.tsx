import { BrowserRouter } from 'react-router-dom';
import './App.scss';
import { Bar3DChart } from './components/Bar3DChart';

function App() {
  return (
    <BrowserRouter>
      <div style={{ height: '100%', width: '100%' }}>
        <Bar3DChart
          propData={{
            cityName: 'Boston',
            year: '2021',
          }}
          propState={{}}
          event={{}}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
