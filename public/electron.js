const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { menu } = require('./menu');
const Store = require('./store.js');
const { autoUpdater } = require('electron-updater');

const fs = require('fs');
const readline = require('readline');
const latex = require('node-latex');
const { count } = require('console');

let mainWindow;
const isWindows = 'win32' === process.platform;

const store = new Store({
	configName: 'window-preferences',
	defaults: {
		windowBounds: {
			width: 1600,
			height: 900,
		},
	},
});

app.on('ready', async () => {
	let { width, height } = store.get('windowBounds');

	mainWindow = new BrowserWindow({
		width: width,
		height: height,
		center: true,
		minWidth: 1600 * 0.75,
		minHeight: 900 * 0.75,
		// icon: `${__dirname}/images/logo/birds-kitchen.png`,
		titleBarStyle: 'hidden',
		autoHideMenuBar: true,
		frame: !isWindows,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			worldSafeExecuteJavaScript: true,
		},
	});

	mainWindow
		.loadURL(
			isDev
				? 'http://localhost:3000'
				: `file://${path.join(__dirname, '../build/index.html')}`
		)
		.then((r) => r);
	
	// mainWindow.webContents.openDevTools();	

	mainWindow.on('resize', () => {
		let { width, height } = mainWindow.getBounds();
		store.set('windowBounds', { width, height });
	});

	const prefs = globalShortcut.register('CommandOrControl+,', () => {
		if (mainWindow === BrowserWindow.getFocusedWindow()) {
			mainWindow.webContents.send('appMenu', {
				type: 'preferences',
				tab: 'storage',
			});
		}
	});

	if (!prefs) {
		console.log('globalShortcut registration failed');
	}

	autoUpdater.checkForUpdatesAndNotify();

	mainWindow.on('closed', () => (mainWindow = null));
});

app.disableHardwareAcceleration();

app.on('will-quit', () => {
	globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
	if ('darwin' !== process.platform) {
		app.quit();
	}
});

ipcMain.on('app_version', (e) => {
	e.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
	mainWindow.webContents.on('did-finish-load', () => {
		mainWindow.webContents.send('update_available');
	});
});

autoUpdater.on('update-downloaded', () => {
	mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
	autoUpdater.quitAndInstall();
});

ipcMain.handle(`display-app-menu`, (e, args) => {
	if (isWindows && mainWindow) {
		menu.popup({ window: mainWindow, x: args.x, y: args.y });
	}
});

const processLineByLine = async (formValues) =>{
    let sample_text_file_path = (isDev ? 'G:/TriSem-1/BTP/Btp-4/extraResources/MOM.txt' : path.join(process.resourcesPath,'extraResources','MOM.txt'));
    
    const fileStream = fs.createReadStream(sample_text_file_path);
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity 
    });
  
    let lines = "";
    let count = 0;
    for await (line of rl){
		count+=1;
		let line1 = "";
		if(count==22)
		{
			line1 = line.substring(0,14)+formValues.categories + line.substring(14)
			// console.log("Categiry is: ", formValues.categories);
			lines+= line1+'\n';
		}
		else if(count==29){
			line1 = line.substring(0,18)+"Meeting No:"+formValues.counter + line.substring(18);
			lines+=line1+'\n';
		}
		else if(count==64){
			for(let i=0; i<formValues.list.length; i++){
				let absentee = 'absentee_'+ (i);
				if(formValues[absentee]!= "Absent")
				{
					line1+= line+ " "+formValues.list[i]+' \n';	
				}
			}

			
			lines+=line1;
		}
		else if(count==67){
			for(let i=0; i<formValues.list.length;i++){
				let absentee = 'absentee_'+(i);
				let absentee_details = absentee+'_details';
				if(formValues[absentee]=="Absent")
				{
					line1+="Absent:  "+formValues.list[i]+"     Reason:  "+formValues[absentee_details] +'\n';
				}
			}
			lines+=line1;
		}
		else if(count==74){
			for(let i=0;i<formValues["no_agendas"];i++){
				let agenda_ = "agenda_"+(i+1);
				let agenda_details = agenda_+"details";
				line1+= line + " "+formValues[agenda_]+":\n"+"\n"+formValues[agenda_details]+"\n";
			}

			lines+=line1;
		}
		else{
			lines+=line+'\n';
		}
  
        
        
        
    }
    
    fileStream.destroy();
    return lines;
};

ipcMain.on("pdftest",(event,formValues)=>{
	console.log(formValues.categories);
	processLineByLine(formValues).then(lines =>{

		// console.log(formValues.categories);
		directory_path = (isDev ? 'G:/TriSem-1/BTP/Btp-4/extraResources' : path.join(process.resourcesPath,'extraResources'));
		// console.log("This is direcory paaa: ",directory_path);
		let options = {
			inputs:directory_path,
			fonts:directory_path
        }

		const pdf = latex(lines,options)
		const fileName = formValues.file_path;
		const output = fs.createWriteStream(fileName);
		pdf.pipe(output);

		pdf.on('error', err => {
			console.error(err);
			event.sender.send("pdftestComplete","error",toString(err),formValues.unique);
		})

		pdf.on('finish', () => {
		  console.log('PDF generated!');
		  // para.innerHTML = "Hurray, pdf generated!";   // to renderer
		  event.sender.send("pdftestComplete","complete","",formValues.unique);
		})


		
		
    }).catch((err)=>{
		console.log("The error is :",err);
	});
	// write catch in case of error 
})

ipcMain.on("generate-latex",(event,formValues)=>{
	processLineByLine(formValues).then(lines =>{
	
		const fileName = formValues.file_path;
		// const output = fs.createWriteStream(fileName);
		fs.writeFile(fileName,lines,(err)=>{

			if(err){
				event.sender.send("latex-generated","error",toString(err),formValues.unique);	
			}else{
				event.sender.send("latex-generated","complete","",formValues.unique);
			}
			
		})

		
    });
})