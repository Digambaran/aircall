import Header from './Header.jsx';
import * as styles from 'styles/app.module.css';
const App = () => {
   return (
      <div className={styles.app}>
         <div className={styles.container}>
            <Header />
            <div className={styles.containerView}> Hello World!</div>
         </div>
      </div>
   );
};

export default App;
