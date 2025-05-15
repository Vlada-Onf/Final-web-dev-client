//=============================================================================

const URL_GET_CERTIFICATES = '/certificates/CACertificates.p7b';
const URL_CAS = '/certificates/CAs.json';
const URL_XML_HTTP_PROXY_SERVICE = 'https://umsystem-iit.azurewebsites.net/iit';

//=============================================================================

const SubjectCertTypes = [
  {
    type: EU_SUBJECT_TYPE_UNDIFFERENCED,
    subtype: EU_SUBJECT_CA_SERVER_SUB_TYPE_UNDIFFERENCED,
  },
  {
    type: EU_SUBJECT_TYPE_CA,
    subtype: EU_SUBJECT_CA_SERVER_SUB_TYPE_UNDIFFERENCED,
  },
  {
    type: EU_SUBJECT_TYPE_CA_SERVER,
    subtype: EU_SUBJECT_CA_SERVER_SUB_TYPE_UNDIFFERENCED,
  },
  {type: EU_SUBJECT_TYPE_CA_SERVER, subtype: EU_SUBJECT_CA_SERVER_SUB_TYPE_CMP},
  {
    type: EU_SUBJECT_TYPE_CA_SERVER,
    subtype: EU_SUBJECT_CA_SERVER_SUB_TYPE_OCSP,
  },
  {type: EU_SUBJECT_TYPE_CA_SERVER, subtype: EU_SUBJECT_CA_SERVER_SUB_TYPE_TSP},
  {
    type: EU_SUBJECT_TYPE_END_USER,
    subtype: EU_SUBJECT_CA_SERVER_SUB_TYPE_UNDIFFERENCED,
  },
  {
    type: EU_SUBJECT_TYPE_RA_ADMINISTRATOR,
    subtype: EU_SUBJECT_CA_SERVER_SUB_TYPE_UNDIFFERENCED,
  },
];

const CertKeyTypes = [
  EU_CERT_KEY_TYPE_UNKNOWN,
  EU_CERT_KEY_TYPE_DSTU4145,
  EU_CERT_KEY_TYPE_RSA,
  EU_CERT_KEY_TYPE_ECDSA,
];

const KeyUsages = [
  EU_KEY_USAGE_UNKNOWN,
  EU_KEY_USAGE_DIGITAL_SIGNATURE,
  EU_KEY_USAGE_KEY_AGREEMENT,
];

const CAdESTypes = [
  EU_SIGN_TYPE_CADES_BES,
  EU_SIGN_TYPE_CADES_T,
  EU_SIGN_TYPE_CADES_C,
  EU_SIGN_TYPE_CADES_X_LONG,
  EU_SIGN_TYPE_CADES_X_LONG | EU_SIGN_TYPE_CADES_X_LONG_TRUSTED,
];

//=============================================================================

const EUSignCPTest = NewClass(
    {
      Vendor: 'JSC IIT',
      ClassVersion: '1.0.0',
      ClassName: 'EUSignCPTest',
      CertsLocalStorageName: 'Certificates',
      CRLsLocalStorageName: 'CRLs',
      recepientsCertsIssuers: null,
      recepientsCertsSerials: null,
      PrivateKeyNameSessionStorageName: 'PrivateKeyName',
      PrivateKeySessionStorageName: 'PrivateKey',
      PrivateKeyPasswordSessionStorageName: 'PrivateKeyPassword',
      PrivateKeyCertificatesSessionStorageName: 'PrivateKeyCertificates',
      PrivateKeyCertificatesChainSessionStorageName:
          'PrivateKeyCertificatesChain',
      CACertificatesSessionStorageName: 'CACertificates',
      CAServerIndexSessionStorageName: 'CAServerIndex',
      CAsServers: null,
      CAServer: null,
      offline: false,
      useCMP: false,
      loadPKCertsFromFile: false,
      privateKeyCerts: null,
    },
    function () {
    },
    {
      //1// ІНІЦІАЛІЗАЦІЯ БІБЛІОТЕКИ ****************************************************************************************************

      initialize: function () {
        setStatus('ініціалізація')

        const _onSuccess = function () {
          try {
            euSign.Initialize()
            euSign.SetJavaStringCompliant(true)
            euSign.SetCharset('UTF-16LE')

            euSign.SetRuntimeParameter(EU_MAKE_PKEY_PFX_CONTAINER_PARAMETER, true)

            if (euSign.DoesNeedSetSettings()) {
              euSignTest.setDefaultSettings()

              if (utils.IsStorageSupported()) {
                // euSignTest.loadCertsAndCRLsFromLocalStorage();
              } else {
                document.getElementById('SelectedCertsList').innerHTML =
                    'Локальне сховище не підтримується'
                document.getElementById('SelectedCRLsList').innerHTML =
                    'Локальне сховище не підтримується'
              }
            }

            euSignTest.loadCertsFromServer()
            euSignTest.setCASettings(0)

            if (utils.IsSessionStorageSupported()) {
              const _readPrivateKeyAsStoredFile = function () {
                euSignTest.readPrivateKeyAsStoredFile()
              };
              setTimeout(_readPrivateKeyAsStoredFile, 10)
            }

            setStatus('')
          } catch (e) {
            setStatus('не ініціалізовано')
            alert(e)
          }
        };

        const _onError = function () {
          setStatus('Не ініціалізовано')
          alert(
              'Виникла помилка ' + 'при завантаженні криптографічної бібліотеки',
          )
        };

        euSignTest.loadCAsSettings(_onSuccess, _onError)
      },

      //2// завантажити налаштування CA ****************************************************************************************************

      loadCAsSettings: function (onSuccess, onError) {
        const pThis = this;

        const _onSuccess = function (casResponse) {
          try {
            const servers = JSON.parse(casResponse.replace(/\\'/g, "'"));

            const select = document.getElementById('CAsServersSelect');
            for (let i = 0; i < servers.length; i++) {
              var option = document.createElement('option')
              option.text = servers[i].issuerCNs[0]
              select.add(option)
            }

            var option = document.createElement('option')
            option.text = 'інший'
            select.add(option)

            select.onchange = function () {
              pThis.setCASettings(select.selectedIndex)
            }

            pThis.CAsServers = servers

            onSuccess()
          } catch (e) {
            onError()
          }
        };

        euSign.LoadDataFromServer(URL_CAS, _onSuccess, onError, false)
      },

      //3// завантажити сертифікати з сервера ****************************************************************************************************

      loadCertsFromServer: function () {
        const certificates = utils.GetSessionStorageItem(
            euSignTest.CACertificatesSessionStorageName,
            true,
            false,
        );
        if (certificates != null) {
          try {
            euSign.SaveCertificates(certificates)
            return
          } catch (e) {
            alert(
                'Виникла помилка при імпорті ' +
                'завантажених з сервера сертифікатів ' +
                'до файлового сховища',
            )
          }
        }

        const _onSuccess = function (certificates) {
          try {
            euSign.SaveCertificates(certificates)
            utils.SetSessionStorageItem(
                euSignTest.CACertificatesSessionStorageName,
                certificates,
                false,
            )
          } catch (e) {
            alert(
                'Виникла помилка при імпорті ' +
                'завантажених з сервера сертифікатів ' +
                'до файлового сховища',
            )
          }
        };

        const _onFail = function (errorCode) {
          console.log(
              'Виникла помилка при завантаженні сертифікатів з сервера. ' +
              '(HTTP статус ' +
              errorCode +
              ')',
          )
        };

        utils.GetDataFromServerAsync(
            URL_GET_CERTIFICATES,
            _onSuccess,
            _onFail,
            true,
        )
      },

      //4// встановити параметри за замовчуванням ****************************************************************************************************

      setDefaultSettings: function () {
        try {
          euSign.SetXMLHTTPProxyService(URL_XML_HTTP_PROXY_SERVICE)

          let settings = euSign.CreateFileStoreSettings();
          settings.SetPath('/certificates')
          settings.SetSaveLoadedCerts(true)
          euSign.SetFileStoreSettings(settings)

          settings = euSign.CreateProxySettings()
          euSign.SetProxySettings(settings)

          settings = euSign.CreateTSPSettings()
          euSign.SetTSPSettings(settings)

          settings = euSign.CreateOCSPSettings()
          euSign.SetOCSPSettings(settings)

          settings = euSign.CreateCMPSettings()
          euSign.SetCMPSettings(settings)

          settings = euSign.CreateLDAPSettings()
          euSign.SetLDAPSettings(settings)

          settings = euSign.CreateOCSPAccessInfoModeSettings()
          settings.SetEnabled(true)
          euSign.SetOCSPAccessInfoModeSettings(settings)

          const CAs = this.CAsServers;
          settings = euSign.CreateOCSPAccessInfoSettings()
          for (let i = 0; i < CAs.length; i++) {
            settings.SetAddress(CAs[i].ocspAccessPointAddress)
            settings.SetPort(CAs[i].ocspAccessPointPort)

            for (let j = 0; j < CAs[i].issuerCNs.length; j++) {
              settings.SetIssuerCN(CAs[i].issuerCNs[j])
              euSign.SetOCSPAccessInfoSettings(settings)
            }
          }
        } catch (e) {
          alert('Виникла помилка при встановленні налашувань: ' + e)
        }
      },

      //5// встановити параметри ЦС ****************************************************************************************************

      setCASettings: function (caIndex) {
        try {
          const caServer =
              caIndex < this.CAsServers.length ? this.CAsServers[caIndex] : null;
          const offline = caServer == null || caServer.address == '' ? true : false;
          const useCMP = !offline && caServer.cmpAddress != '';
          const loadPKCertsFromFile =
              caServer == null || (!useCMP && !caServer.certsInKey);

          euSignTest.CAServer = caServer
          euSignTest.offline = offline
          euSignTest.useCMP = useCMP
          euSignTest.loadPKCertsFromFile = loadPKCertsFromFile

          let settings;

          settings = euSign.CreateTSPSettings()
          if (!offline) {
            settings.SetGetStamps(true)
            if (caServer.tspAddress != '') {
              settings.SetAddress(caServer.tspAddress)
              settings.SetPort(caServer.tspAddressPort)
            } else {
              settings.SetAddress('acskidd.gov.ua')
              settings.SetPort('80')
            }
          }
          euSign.SetTSPSettings(settings)

          settings = euSign.CreateOCSPSettings()
          if (!offline) {
            settings.SetUseOCSP(true)
            settings.SetBeforeStore(true)
            settings.SetAddress(caServer.ocspAccessPointAddress)
            settings.SetPort('80')
          }
          euSign.SetOCSPSettings(settings)

          settings = euSign.CreateCMPSettings()
          settings.SetUseCMP(useCMP)
          if (useCMP) {
            settings.SetAddress(caServer.cmpAddress)
            settings.SetPort('80')
          }
          euSign.SetCMPSettings(settings)

          settings = euSign.CreateLDAPSettings()
          euSign.SetLDAPSettings(settings)
        } catch (e) {
          alert('Виникла помилка при встановленні налашувань: ' + e)
        }
      },

      //6// випадаючий список ЦСК ****************************************************************************************************

      getCAServer: function () {
        // отримати CA Server
        const index = document.getElementById('CAsServersSelect').selectedIndex;

        if (index < euSignTest.CAsServers.length)
          return euSignTest.CAsServers[index]

        return null
      },
      loadCAServer: function () {
        // завантажити сервер ЦС
        const index = utils.GetSessionStorageItem(
            euSignTest.CAServerIndexSessionStorageName,
            false,
            false,
        );
        if (index != null) {
          document.getElementById('CAsServersSelect').selectedIndex =
              parseInt(index)
          euSignTest.setCASettings(parseInt(index))
        }
      },
      storeCAServer: function () {
        // зберігати сервер CA
        const index = document.getElementById('CAsServersSelect').selectedIndex;
        return utils.SetSessionStorageItem(
            euSignTest.CAServerIndexSessionStorageName,
            index.toString(),
            false,
        )
      },
      removeCAServer: function () {
        // видалити сервер CA
        utils.RemoveSessionStorageItem(euSignTest.CAServerIndexSessionStorageName)
      },

      //7// зберігає закритий ключ ****************************************************************************************************

      storePrivateKey: function (keyName, key, password, certificates) {
        if (
            !utils.SetSessionStorageItem(
                euSignTest.PrivateKeyNameSessionStorageName,
                keyName,
                false,
            ) ||
            !utils.SetSessionStorageItem(
                euSignTest.PrivateKeySessionStorageName,
                key,
                false,
            ) ||
            !utils.SetSessionStorageItem(
                euSignTest.PrivateKeyPasswordSessionStorageName,
                password,
                true,
            ) ||
            !euSignTest.storeCAServer()
        ) {
          return false
        }

        if (Array.isArray(certificates)) {
          if (
              !utils.SetSessionStorageItems(
                  euSignTest.PrivateKeyCertificatesSessionStorageName,
                  certificates,
                  false,
              )
          ) {
            return false
          }
        } else {
          if (
              !utils.SetSessionStorageItem(
                  euSignTest.PrivateKeyCertificatesChainSessionStorageName,
                  certificates,
                  false,
              )
          ) {
            return false
          }
        }

        return true
      },

      //8// видалити збережений закритий ключ (при натисканні видаляє данні авторизованого користувача) ****************************************************************************************************

      removeStoredPrivateKey: function () {
        utils.RemoveSessionStorageItem(
            euSignTest.PrivateKeyNameSessionStorageName,
        )
        utils.RemoveSessionStorageItem(euSignTest.PrivateKeySessionStorageName)
        utils.RemoveSessionStorageItem(
            euSignTest.PrivateKeyPasswordSessionStorageName,
        )
        utils.RemoveSessionStorageItem(
            euSignTest.PrivateKeyCertificatesChainSessionStorageName,
        )
        utils.RemoveSessionStorageItem(
            euSignTest.PrivateKeyCertificatesSessionStorageName,
        )

        euSignTest.removeCAServer()
      },

      //9// виберіть Файл приватного ключа ****************************************************************************************************

      selectPrivateKeyFile: function (event) {
        const enable = event.target.files.length === 1;

        setPointerEvents(document.getElementById('PKeyReadButton'), enable)
        // document.getElementById('PKeyPassword').disabled="true" =
        //     enable ? '' : 'disabled="true"';
        document.getElementById('PKeyFileName').value = enable
            ? event.target.files[0].name
            : ''
        document.getElementById('PKeyPassword').value = ''

        if (enable) {
          const file = event.target.files[0];
          setPointerEvents(
              document.getElementById('PKeySaveInfo'),
              file.name.endsWith('.jks'),
          )
        }
      },

      //10// отримати сертифікати приватного ключа від CMP ****************************************************************************************************

      getPrivateKeyCertificatesByCMP: function (
          key,
          password,
          onSuccess,
          onError,
      ) {
        try {
          const cmpAddress = euSignTest.getCAServer().cmpAddress + ':80';
          const keyInfo = euSign.GetKeyInfoBinary(key, password);
          onSuccess(euSign.GetCertificatesByKeyInfo(keyInfo, [cmpAddress]))
        } catch (e) {
          onError(e)
        }
      },

      //11// отримати сертифікати приватного ключа ****************************************************************************************************

      getPrivateKeyCertificates: function (
          key,
          password,
          fromCache,
          onSuccess,
          onError,
      ) {
        let certificates;

        if (euSignTest.CAServer != null && euSignTest.CAServer.certsInKey) {
          onSuccess([])
          return
        }

        if (fromCache) {
          if (euSignTest.useCMP) {
            certificates = utils.GetSessionStorageItem(
                euSignTest.PrivateKeyCertificatesChainSessionStorageName,
                true,
                false,
            )
          } else if (euSignTest.loadPKCertsFromFile) {
            certificates = utils.GetSessionStorageItems(
                euSignTest.PrivateKeyCertificatesSessionStorageName,
                true,
                false,
            )
          }

          onSuccess(certificates)
        } else if (euSignTest.useCMP) {
          euSignTest.getPrivateKeyCertificatesByCMP(
              key,
              password,
              onSuccess,
              onError,
          )
        } else if (euSignTest.loadPKCertsFromFile) {
          const _onSuccess = function (files) {
            const certificates = [];
            for (let i = 0; i < files.length; i++) {
              certificates.push(files[i].data)
            }
            onSuccess(certificates)
          };

          euSign.ReadFiles(euSignTest.privateKeyCerts, _onSuccess, onError)
        }
      },

      //12// прочитати закритий ключ ****************************************************************************************************

      readPrivateKey: function (keyName, key, password, certificates, fromCache) {
        const _onError = function (e) {
          setStatus('')

          if (fromCache) {
            euSignTest.removeStoredPrivateKey()
            euSignTest.privateKeyReaded(false)
          } else {
            alert(e)
          }

          if (
              e.GetErrorCode != null &&
              e.GetErrorCode() == EU_ERROR_CERT_NOT_FOUND
          ) {
          }
        };

        if (certificates == null) {
          const _onGetCertificates = function (certs) {
            if (certs == null) {
              _onError(euSign.MakeError(EU_ERROR_CERT_NOT_FOUND))
              return
            }

            euSignTest.readPrivateKey(keyName, key, password, certs, fromCache)
          };

          euSignTest.getPrivateKeyCertificates(
              key,
              password,
              fromCache,
              _onGetCertificates,
              _onError,
          )
          return
        }

        try {
          if (Array.isArray(certificates)) {
            for (let i = 0; i < certificates.length; i++) {
              euSign.SaveCertificate(certificates[i])
            }
          } else {
            euSign.SaveCertificates(certificates)
          }

          euSign.ReadPrivateKeyBinary(key, password)

          if (!fromCache && utils.IsSessionStorageSupported()) {
            if (
                !euSignTest.storePrivateKey(keyName, key, password, certificates)
            ) {
              euSignTest.removeStoredPrivateKey()
            }
          }

          euSignTest.privateKeyReaded(true)

          // if (!fromCache)
          //     euSignTest.showOwnerInfo();
        } catch (e) {
          _onError(e)
        }
      },

      //13// прочитати закритий ключ як збережений файл (після перезапуску строрінки) ****************************************************************************************************

      readPrivateKeyAsStoredFile: function () {
        const keyName = utils.GetSessionStorageItem(
            euSignTest.PrivateKeyNameSessionStorageName,
            false,
            false,
        );
        const key = utils.GetSessionStorageItem(
            euSignTest.PrivateKeySessionStorageName,
            true,
            false,
        );
        const password = utils.GetSessionStorageItem(
            euSignTest.PrivateKeyPasswordSessionStorageName,
            false,
            true,
        );
        if (keyName == null || key == null || password == null) return

        euSignTest.loadCAServer()

        setStatus('зчитування ключа')
        setPointerEvents(document.getElementById('PKeyReadButton'), true)
        document.getElementById('PKeyFileName').value = keyName
        document.getElementById('PKeyPassword').value = password
        const _readPK = function () {
          euSignTest.readPrivateKey(keyName, key, password, null, true)
        };
        setTimeout(_readPK, 10)

        return
      },

      //14// ЗЧИТУВАННЯ ОСОБИСТОГО КЛЮЧА (НАТИСКАННЯ НА КНОПКУ ЗЧИТАТИ) //****************************************************************************************************

      readPrivateKeyButtonClick: function () {
        const passwordTextField = document.getElementById('PKeyPassword');
        const certificatesFiles = euSignTest.privateKeyCerts;

        const _onError = function (e) {
          setStatus('')
          alert(e)
        };

        const _onSuccess = function (keyName, key) {
          euSignTest.readPrivateKey(
              keyName,
              new Uint8Array(key),
              passwordTextField.value,
              null,
              false,
          )
          // euSignTest.showOwnerInfo();
        };

        try {
          // if (document.getElementById('PKeyReadButton').title == 'Підписати') {
          setStatus('зчитування ключа')

          const files = document.getElementById('PKeyFileInput').files;
          if (files.length != 1) {
            _onError(
                'Виникла помилка при зчитуванні особистого ключа. ' +
                'Опис помилки: файл з особистим ключем не обрано',
            )
            return
          }

          if (passwordTextField.value == '') {
            passwordTextField.focus()
            _onError(
                'Виникла помилка при зчитуванні особистого ключа. ' +
                'Опис помилки: не вказано пароль доступу до особистого ключа',
            )
            return
          }

          if (
              euSignTest.loadPKCertsFromFile &&
              (certificatesFiles == null || certificatesFiles.length <= 0)
          ) {
            _onError(
                'Виникла помилка при зчитуванні особистого ключа. ' +
                'Опис помилки: не обрано жодного сертифіката відкритого ключа',
            )
            return
          }

          // if (utils.IsFileImage(files[0])) {
          //     euSignTest.readPrivateKeyAsImage(files[0], _onSuccess, _onError);
          // } else {
          const _onFileRead = function (readedFile) {
            _onSuccess(readedFile.file.name, readedFile.data)
          };

          euSign.ReadFile(files[0], _onFileRead, _onError)
          // }
          // } else {
          //     euSignTest.removeStoredPrivateKey();
          //     euSign.ResetPrivateKey();
          //     euSignTest.privateKeyReaded(false);
          //     passwordTextField.value = "";
          // }
        } catch (e) {
          _onError(e)
        }
      },

      //15// ПРОДЕМОНСТРУВАТИ ІНФОРМАЦІЮ КОРИСТУВАЧА //****************************************************************************************************

      showOwnerInfo: function () {
        try {
          const ownerInfo = euSign.GetPrivateKeyOwnerInfo();

          alert(
              'Власник: ' +
              ownerInfo.GetSubjCN() +
              '\n' +
              'ЦСК: ' +
              ownerInfo.GetIssuerCN() +
              '\n' +
              'Серійний номер: ' +
              ownerInfo.GetSerial(),
          )
        } catch (e) {
          alert(e)
        }
      },

      //16// ПРОДЕМОНСТРУВАТИ ІНФОРМАЦІЮ ПРО СЕРТИФІКАТИ КОРИСТУВАЧА //****************************************************************************************************

      showOwnCertificates: function () {
        try {
          const splitLine = '--------------------------------------------------';
          let message = 'Інформація про сертифікат(и) користувача:\n';
          let i = 0;
          while (true) {
            const info = euSign.EnumOwnCertificates(i);
            if (info == null) break

            const isNationalAlgs =
                info.GetPublicKeyType() == EU_CERT_KEY_TYPE_DSTU4145;

            message += splitLine + '\n'
            message +=
                'Сертифікат № ' +
                (i + 1) +
                '\n' +
                'Власник: ' +
                info.GetSubjCN() +
                '\n' +
                'ЦСК: ' +
                info.GetIssuerCN() +
                '\n' +
                'Серійний номер: ' +
                info.GetSerial() +
                '\n' +
                'Призначення: ' +
                info.GetKeyUsage() +
                (isNationalAlgs ? ' в державних ' : ' в міжнародних ') +
                'алгоритмах та протоколах' +
                '\n'
            message += splitLine + '\n'

            i++
          }

          if (i == 0) message += 'Відсутня'

          alert(message)
        } catch (e) {
          alert(e)
        }
      },

      //17// ОТРИМАТИ ІНФОРМАЦІЮ ПРО КОНТЕЙНЕР JKS (ЗБЕРІГАННЯ ІНФОРМАЦІЙ ПРО КЛЮЧ) //****************************************************************************************************

      getJKSContainerInfo: function (jksContainer, password) {
        let info = '\tІнформація про JKS контейнер:\n';

        try {
          let keyIndex = 0;
          while (true) {
            const keyAlias = euSign.EnumJKSPrivateKeys(jksContainer, keyIndex);
            if (keyAlias == null) break
            const jksKey = euSign.GetJKSPrivateKey(jksContainer, keyAlias);

            info += keyIndex + 1 + '\n'
            info += 'Alias ключа: ' + keyAlias + '\n'
            info += 'Сертифікати: ' + '\n'

            for (let i = 0; i < jksKey.GetCertificatesCount(); i++) {
              const cert = jksKey.GetCertificate(i);
              const certInfo = euSign.ParseCertificate(cert);
              info += 'Сертифікат № ' + (i + 1) + '\n'
              info += 'Власник: ' + certInfo.GetSubject() + '\n'
              info += 'ЦСК: ' + certInfo.GetIssuer() + '\n'
              info += 'Реєстраційний номер: ' + certInfo.GetSerial() + '\n'
              info += 'Призначення: ' + certInfo.GetKeyUsage() + '\n'
              info +=
                  'Розширенне призначення: ' + certInfo.GetExtKeyUsages() + '\n'
              info += 'Бінарне подання: ' + euSign.Base64Encode(cert) + '\n'
            }

            info += 'Інформація про відкриті ключі:\n'
            try {
              const keyInfo = euSign.GetKeyInfoBinary(
                  jksKey.GetPrivateKey(),
                  password,
              );
              info += 'Бінарне подання: ' + euSign.Base64Encode(keyInfo) + '\n'
            } catch (e) {
              info += e + '\n'
            }

            keyIndex++
          }
        } catch (e) {
          info += e + '\n'
        }

        return info
      },

      //18// ЗБЕРЕГТИ ІНФОРМАЦІЮ ПРО КЛЮЧ //****************************************************************************************************

      savePKeyInfo: function () {
        const pThis = this;
        const pkFileInput = document.getElementById('PKeyFileInput');

        if (pkFileInput.files.length == 0) {
          alert('Файл з особистим ключем не обрано')
          return
        }

        const _onError = function (msg) {
          alert(
              'Виникла помилка при ' + 'збереженні інформації про ос. ключ. ' + msg,
          )
        };

        const pkFile = pkFileInput.files[0];
        const password = document.getElementById('PKeyPassword').value;
        let info = 'Інформація про ос. ключ:\n';
        info += 'Ім`я файлу:' + pkFile.name + '\n\n'

        const encoder = new StringEncoder('UTF-8', true);

        eu_wait(function (runNext) {
          euSign.ReadFile(pkFile, runNext, function (e) {
            _onError(e)
          })
        }).eu_wait(function (runNext, pkFileData) {
          const keyData = pkFileData.data;
          if (pkFile.name.endsWith('.jks')) {
            info += pThis.getJKSContainerInfo(keyData, password) + '\n'
          } else {
            info += 'Інформація про відкритий ключ:\n'
            try {
              const keyInfo = euSign.GetKeyInfoBinary(keyData, password);
              info += 'Бінарне подання: ' + euSign.Base64Encode(keyInfo) + '\n'
            } catch (e) {
              info += e + '\n'
            }
          }

          info += 'Інформація про зчитаний ключ:\n'
          try {
            if (euSign.IsPrivateKeyReaded()) {
              let i = 0;
              while (true) {
                const certInfo = euSign.EnumOwnCertificates(i);
                if (certInfo == null) break
                const cert = euSign.GetCertificate(
                    certInfo.GetIssuer(),
                    certInfo.GetSerial(),
                );

                info += 'Сертифікат № ' + (i + 1) + '\n'
                info += 'Власник: ' + certInfo.GetSubject() + '\n'
                info += 'ЦСК: ' + certInfo.GetIssuer() + '\n'
                info += 'Реєстраційний номер: ' + certInfo.GetSerial() + '\n'
                info += 'Призначення: ' + certInfo.GetKeyUsage() + '\n'
                info +=
                    'Розширенне призначення: ' + certInfo.GetExtKeyUsages() + '\n'
                info += 'Бінарне подання: ' + euSign.Base64Encode(cert) + '\n'

                i++
              }
            } else {
              info += 'Ключ не зчитано' + '\n'
            }
          } catch (e) {
            info += e + '\n'
          }

          saveFile(pkFile.name + '.txt', new Uint8Array(encoder.encode(info)))
        })
      },

      //19// НАЛАШТУВАННЯ ПІДПИСУ //****************************************************************************************************

      signData: function () {
        const isInternalSign = document.getElementById(
            'InternalSignCheckbox',
        ).checked;

        signedDataText.value = ''

        const _signDataFunction = function () {
          try {
            let sign = '';

            if (isInternalSign) {
              sign = euSign.SignDataInternal(false, data, true)
            } else {
              sign = euSign.SignData(data, true)
            }

            signedDataText.value = sign
            setStatus('')
          } catch (e) {
            setStatus('')
            alert(e)
          }
        };

        setStatus('підпис данних')
        setTimeout(_signDataFunction, 10)
      },

      //20// ОТРИМАТИ ФОРМАТУ ПІДПИСУ //****************************************************************************************************

      getSignTypeString: function (signType) {
        switch (signType) {
          case EU_SIGN_TYPE_CADES_BES:
            return 'базовий'
          case EU_SIGN_TYPE_CADES_T:
            return 'з позначкою часу від ЕЦП'
          case EU_SIGN_TYPE_CADES_C:
            return 'з посиланням на повні дані для перевірки'
          case EU_SIGN_TYPE_CADES_X_LONG:
            return 'з повними даними для перевірки'
          case EU_SIGN_TYPE_CADES_X_LONG | EU_SIGN_TYPE_CADES_X_LONG_TRUSTED:
            return 'з повними даними ЦСК для перевірки'
          default:
            return 'невизначено'
        }
      },

      //21// ПЕРЕВІРКА ПІДПИСУ (ВИВІД ІНВОРМАЦІЇ В АЛЕРТ) //****************************************************************************************************

      verifyData: function () {
        const isInternalSign = document.getElementById(
            'InternalSignCheckbox',
        ).checked;
        const isGetSignerInfo = document.getElementById(
            'GetSignInfoCheckbox',
        ).checked;

        const _verifyDataFunction = function () {
          try {
            const info = '';

            let message = 'Підпис успішно перевірено';

            if (isGetSignerInfo) {
              const ownerInfo = info.GetOwnerInfo();
              const timeInfo = info.GetTimeInfo();

              message += '\n'
              message +=
                  'Підписувач: ' +
                  ownerInfo.GetSubjCN() +
                  '\n' +
                  'ЦСК: ' +
                  ownerInfo.GetIssuerCN() +
                  '\n' +
                  'Серійний номер: ' +
                  ownerInfo.GetSerial() +
                  '\n'
              if (timeInfo.IsTimeAvail()) {
                message +=
                    (timeInfo.IsTimeStamp()
                        ? 'Мітка часу (від даних):'
                        : 'Час підпису: ') + timeInfo.GetTime()
              } else {
                message += 'Час підпису відсутній'
              }

              if (timeInfo.IsSignTimeStampAvail()) {
                message +=
                    '\nМітка часу (від підпису):' + timeInfo.GetSignTimeStamp()
              }

              message += '\nТип підпису: ' + signType
            }

            if (isInternalSign) {
              message += '\n'
              verifiedDataText.value = euSign.ArrayToString(info.GetData())
              message += 'Підписані дані: ' + verifiedDataText.value + '\n'
            }

            setStatus('')
            alert(message)
          } catch (e) {
            setStatus('')
            alert(e)
          }
        };

        setStatus('перевірка підпису даних')
        setTimeout(_verifyDataFunction, 10)
      },

      //22// ПІДПИСАННЯ ФАЙЛУ ****************************************************************************************************

      signFile: function () {
        //console.log(23456)
        euSignTest.readPrivateKeyButtonClick()
        const documents = JSON.parse(document.getElementById('table-documents-list').value)

        const accessToken = document.getElementById('access-token').value;
        // var file = document.getElementById('FileToSign').files[0];
        //
        // if (file.size > Module.MAX_DATA_SIZE) {
        //     alert("Розмір файлу для піпису занадто великий. Оберіть файл меншого розміру");
        //     return;
        // }
        documents.forEach(function (document) {
          // Fetch file and convert  to Uint8Array
          //console.log(document, 'document')
          fetch(
              'https://umsystem-documents.azurewebsites.net/documents/' + document.id+'/download/bytes',
              {
                method: 'get',
                headers: {
                  Accept: 'application/json',
                  "Authorization": "Bearer " + accessToken,
                },
              },
          ).then(response => {
            response.blob().then(blob => {
              const file = new File([blob], document.fileName, {
                lastModified: new Date().getTime(),
                type: blob.type,
              })
              let fileReader = new FileReader()

              fileReader.onloadend = (function (fileName) {
                return function (evt) {
                  if (evt.target.readyState != FileReader.DONE) return

                  const data = new Uint8Array(evt.target.result)

                  try {
                    let sign

                    sign = euSign.SignData(data, false)

                    // TODO save file in s3
                    saveFile(fileName + '.p7s',document.id, sign)

                    setStatus('')
                    // add notification
                    alert('Файл успішно підписано')
                  } catch (e) {
                    setStatus('')
                    alert(e)
                  }
                }
              })(file.name)
              //
              setStatus('підпис файлу')
              fileReader.readAsArrayBuffer(file)
            })
          })
        });
        // var data = new Uint8Array();

        // try {
        //   var sign;

        // if (isInternalSign)
        //   sign = euSign.SignDataInternal(false, data, false);
        // else
        //   sign = euSign.SignData(data, false);
      },

      //23// ПЕРЕВІРКА ПІДПИСАНОГО ФАЙЛУ ****************************************************************************************************

      verifyFile: function () {
        const pThis = this;
        const isInternalSign = document.getElementById(
            'InternalSignCheckbox',
        ).checked;
        const isGetSignerInfo = document.getElementById(
            'GetSignInfoCheckbox',
        ).checked;
        const files = [];

        files.push(document.getElementById('FileToVerify').files[0])
        if (!isInternalSign)
          files.push(document.getElementById('FileWithSign').files[0])

        if (
            files[0].size > Module.MAX_DATA_SIZE + EU_MAX_P7S_CONTAINER_SIZE ||
            (!isInternalSign && files[1].size > Module.MAX_DATA_SIZE)
        ) {
          alert(
              'Розмір файлу для перевірки підпису занадто великий. Оберіть файл меншого розміру',
          )
          return
        }

        const _onSuccess = function (files) {
          try {
            let info = '';
            if (isInternalSign) {
              info = euSign.VerifyDataInternal(files[0].data)
            } else {
              info = euSign.VerifyData(files[0].data, files[1].data)
            }
            const signType = pThis.getSignTypeString(
                euSign.GetSignType(0, files[isInternalSign ? 0 : 1].data),
            );

            let message = 'Підпис успішно перевірено';

            if (isGetSignerInfo) {
              const ownerInfo = info.GetOwnerInfo();
              const timeInfo = info.GetTimeInfo();

              message += '\n'
              message +=
                  'Підписувач: ' +
                  ownerInfo.GetSubjCN() +
                  '\n' +
                  'ЦСК: ' +
                  ownerInfo.GetIssuerCN() +
                  '\n' +
                  'Серійний номер: ' +
                  ownerInfo.GetSerial() +
                  '\n'
              if (timeInfo.IsTimeAvail()) {
                message +=
                    (timeInfo.IsTimeStamp()
                        ? 'Мітка часу (від даних):'
                        : 'Час підпису: ') + timeInfo.GetTime()
              } else {
                message += 'Час підпису відсутній'
              }

              if (timeInfo.IsSignTimeStampAvail()) {
                message +=
                    '\nМітка часу (від підпису):' + timeInfo.GetSignTimeStamp()
              }

              message += '\nТип підпису: ' + signType
            }

            alert(message)
            setStatus('')
          } catch (e) {
            alert(e)
            setStatus('')
          }
        };

        const _onFail = function (files) {
          setStatus('')
          alert('Виникла помилка при зчитуванні файлів для перевірки підпису')
        };

        setStatus('перевірка підпису файлів')
        utils.LoadFilesToArray(files, _onSuccess, _onFail)
      },

      //24// НАЛАШТУВАННЯ ПРАПОРЦІВ (Використовувати внутрішній підпис блокування поля підписаний файл) Checkbox //****************************************************************************************************

      useInternalSignCheckBoxClick: function () {
        const intSignCheckbox = document.getElementById('InternalSignCheckbox');

        const fileWithSignSelectFile = document.getElementById('FileWithSign');

        // if (intSignCheckbox.checked) {
        //
        //     fileWithSignSelectFile.disabled="true" = 'disabled="true"';
        // } else {
        //
        //     fileWithSignSelectFile.disabled="true" = '';
        // }
      },

      //25// ОБРАННЯ ФОРМАТУ ПІДПИСУ З ВИПАДАЮЧОГО СПИСКУ ****************************************************************************************************

      DSCAdESTypeChanged: function () {
        const signType =
            CAdESTypes[document.getElementById('DSCAdESTypeSelect').selectedIndex];
        try {
          euSign.SetRuntimeParameter(EU_SIGN_TYPE_PARAMETER, signType)
        } catch (e) {
          alert(e)
        }

        // document.getElementById('SignAddCAsCertificatesCheckbox').disabled="true" =
        //     ((signType & EU_SIGN_TYPE_CADES_X_LONG) ==
        //         EU_SIGN_TYPE_CADES_X_LONG) ? '' : 'disabled="true"';
      },

      //26// ДОДАТИ ПОЗНАЧКУ ЧАСУ ВІД ДАНИХ Checkbox ****************************************************************************************************

      signAddContentTimestampCheckBoxClick: function () {
        try {
          euSign.SetRuntimeParameter(
              EU_SIGN_INCLUDE_CONTENT_TIME_STAMP_PARAMETER,
              document.getElementById('SignAddContentTimestampCheckbox').checked,
          )
        } catch (e) {
          alert(e)
        }
      },

      //26// ДОДАТИ ПОВНІ ДАНІ ДЛЯ ПЕРЕВІРКИ Checkbox ****************************************************************************************************

      signAddCAsCertificatesCheckBoxClick: function () {
        try {
          euSign.SetRuntimeParameter(
              EU_SIGN_INCLUDE_CA_CERTIFICATES_PARAMETER,
              document.getElementById('SignAddCAsCertificatesCheckbox').checked,
          )
        } catch (e) {
          alert(e)
        }
      },

      //28// ПРИВАТНИЙ КЛЮЧ ЗЧИТАНО (БЛОКУВАННЯ ПОЛІВ) ****************************************************************************************************

      privateKeyReaded: function (isReaded) {
        // let enabled = '';
        // let disabled = 'disabled="true"';

        // if (!isReaded) {
        //   enabled = 'disabled="true"'
        //   disabled  = ''
        // }

        setStatus('')

        // document.getElementById('CAsServersSelect').disabled="true" = disabled="true";
        setPointerEvents(
            document.getElementById('PKeySelectFileButton'),
            !isReaded,
        )
        // document.getElementById('PKeyFileName').disabled="true" = disabled="true";

        // document.getElementById('PKeyReadButton').title = isReaded ? 'Стерти' : 'Зчитати';
        // document.getElementById('PKeyReadButton').innerHTML = isReaded ? 'Стерти' : 'Зчитати';

        // document.getElementById('KeyReadedImage').nng.display = isReaded ? "inline" : 'none';

        setPointerEvents(
            document.getElementById('PKeyShowOwnerInfoButton'),
            isReaded,
        )
        setPointerEvents(
            document.getElementById('PKeyShowCertsInfoButton'),
            isReaded,
        )
        setPointerEvents(document.getElementById('PKeySaveInfo'), isReaded)

        // document.getElementById('PKeyPassword').disabled="true" = disabled="true";

        if (!isReaded) {
          document.getElementById('PKeyPassword').value = ''
          // document.getElementById('PKeyPassword').disabled="true" = 'disabled="true"';
          document.getElementById('PKeyFileName').value = ''
          document.getElementById('PKeyFileInput').value = null
          setPointerEvents(document.getElementById('PKeyReadButton'), false)
        }
        // document.getElementById('FileToSign').disabled="true" = enabled;
        setPointerEvents(document.getElementById('SignFileButton'), isReaded)
      },
    },
);

//=============================================================================

var euSignTest = EUSignCPTest()
var euSign = EUSignCP()
var utils = Utils(euSign)

//=============================================================================

function setPointerEvents(element, enable) {
  // встановити події вказівника
  // element.style.pointerEvents = enable ? "auto" : "none";
}

function setStatus(message) {
  // встановити статус
  // if (message != '')
  //     message = '(' + message + '...)';
  // document.getElementById('status').innerHTML = message;
}

function saveFile(fileName,id, array) {
  const accessToken = document.getElementById('access-token').value
  // зберегти файл
  const blob = new Blob([array], {type: 'application/octet-stream'});
  const file = new File([blob], fileName, {
    lastModified: new Date().getTime(),
    type: blob.type,
  });
  let formData = new FormData()

  formData.append('file', file)
  fetch(
    'https://umsystem-documents.azurewebsites.net/documents/'+id+'/sign',
    {method: 'POST', body: formData,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      }
    },
  )
  //saveAs(blob, fileName);
}

function pageLoaded() {
  // сторінка завантажена
  document
    .getElementById('PKeyFileInput')
    .addEventListener('change', euSignTest.selectPrivateKeyFile, false)

  const appendMaxFileSizeLimit = function (textLabelId) {
    let str = document.getElementById(textLabelId).innerHTML;
    str =
        str.substring(0, str.length - 1) +
        ' (не більше ' +
        EU_MAX_DATA_SIZE_MB +
        ' МБ):'
    document.getElementById(textLabelId).innerHTML = str
  };

  appendMaxFileSizeLimit('ChooseFileForSignTextLabel')
  appendMaxFileSizeLimit('ChooseFileForVerifyTextLabel')
}

function EUSignCPModuleInitialized(isInitialized) {
  // Модуль EUSign CP ініціалізовано
  if (isInitialized) euSignTest.initialize()
  else alert('Криптографічну бібліотеку не ініціалізовано')
}

//============================================================================
