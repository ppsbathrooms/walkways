import ReactDOM from 'react-dom/client'
import Header from './components/Header'
import Home from './components/Home'
import '../style/style.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
    <div>
        <Header/>
        <Home/>
    </div>
)