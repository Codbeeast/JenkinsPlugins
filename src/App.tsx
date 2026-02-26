import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Dashboards from './pages/Dashboards';
import PluginDetail from './pages/PluginDetail';
import DataExplorer from './pages/DataExplorer';
import Methodology from './pages/Methodology';
import DataDictionary from './pages/DataDictionary';

export default function App() {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Overview />} />
                    <Route path="/dashboards" element={<Dashboards />} />
                    <Route path="/plugin/:pluginName" element={<PluginDetail />} />
                    <Route path="/explorer" element={<DataExplorer />} />
                    <Route path="/methodology" element={<Methodology />} />
                    <Route path="/data-dictionary" element={<DataDictionary />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
