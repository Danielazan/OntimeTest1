import React, { useContext, useEffect, useState } from 'react'
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import SQLite from 'react-native-sqlite-storage';

const DatabaseContext = React.createContext()

export function useDatabase() {
  return useContext(DatabaseContext)
}

export function DatabaseProvider({ children }) {
  const [database, setDatabase] = useState(null)

  const openDatabase = async () => {
    const localFolder = FileSystem.documentDirectory + 'SQLite'
    const dbName = 'ontime10.db'
    const localURI = localFolder + '/' + dbName

    if (!(await FileSystem.getInfoAsync(localFolder)).exists) {
      await FileSystem.makeDirectoryAsync(localFolder)
    }

    let asset = Asset.fromModule(require('../../assets/data/ontime10.db'))

    if (!asset.downloaded) {
      await asset.downloadAsync().then(value => {
        asset = value
        console.log('asset downloadAsync - finished')
      })

      let remoteURI = asset.localUri

      await FileSystem.copyAsync({
        from: remoteURI,
        to: localURI
      }).catch(error => {
        console.log('asset copyDatabase - finished with error: ' + error)
      })
    } else {
      if (asset.localUri || asset.uri.startsWith("asset") || asset.uri.startsWith("file")) {
        let remoteURI = asset.localUri || asset.uri

        await FileSystem.copyAsync({
          from: remoteURI,
          to: localURI
        }).catch(error => {
          console.log("local copyDatabase - finished with error: " + error)
        })
      } else if (asset.uri.startsWith("http") || asset.uri.startsWith("https")) {
        let remoteURI = asset.uri

        await FileSystem.downloadAsync(remoteURI, localURI)
          .catch(error => {
            console.log("local downloadAsync - finished with error: " + error)
          })
      }
    }

    return SQLite.openDatabase(dbName)
  }

  useEffect(() => {
    openDatabase().then((db) => {
      db.transaction((tx) => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS message (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT)',
          [],
          () => {
            console.log('Table "message" created successfully');
            setDatabase(db); // Set database after table creation
          },
          (_, error) => {
            console.error('Error creating table "message":', error);
          }
        );

        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS ChatNames (id INTEGER PRIMARY KEY AUTOINCREMENT, Names TEXT)',
          [],
          () => {
            console.log('Table "Chatnames" created successfully');
            setDatabase(db); // Set database after table creation
          },
          (_, error) => {
            console.error('Error creating table "ChatNames":', error);
          }
        );
      });
    });
  }, []);

  return (
    <DatabaseContext.Provider value={database}>
      {children}
    </DatabaseContext.Provider>
  )
}