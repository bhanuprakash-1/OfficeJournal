import React from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import {connect} from 'react-redux';
import { withTranslation } from 'react-i18next';
import hoistStatics from 'hoist-non-react-statics';
//import StarRatingComponent from 'react-star-rating-controlled-component';
//import ImageUploader from 'react-images-upload';
import fs from 'fs';

import Modal from '../modal';
import Api from '../../core/api';
import ApiCommittee from '../../core/api-committee'
import { ChoiceField, NumberField, TextareaField, TextField, TagsField, MarkdownField, UrlField} from '../form-elements';
import {isTextValid} from '../../core/utils';
import SvgIcon from '../svgicon';
import { NotyHelpers, ReduxHelpers, TagHelpers, StorageHelpers } from '../../core/helpers';
import { CommitteeHelpers } from '../../core/helpers-committee';
import '../i18n';

import './style.scss';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const {remote} = require('electron');
const curr_window = remote.getCurrentWindow();
const dialog = remote.dialog;


class RecipeCrudModalNotExtended extends React.Component {
    state = {
		formValues: {},
		errorValues: {},
		autoSuggest: [],
        isMouseInside: false,
        onprint:0,
        list:[],
        servings:0,
        list2:[],
        absenteetype:['Present','Absent']

	};

	componentDidUpdate( prevProps, prevState, snapshot ) {
		const { id, show } = this.props;

		if ( show && id && prevProps.show !== show ) {
			const formValues = new Api().getRecipeById( id );
            this.setState( { formValues } );
            
            const temp = new Api().getRecipeById(id);
            const temp_committee = new ApiCommittee().getCommitteeByTitle(temp.categories)
            if(temp.id!=undefined)
            {for(let i=0;i<temp_committee.servings;i++)
            {
                let attendee_number = 'attendee_'+(i);
                let member_number = 'member_'+(i);
                this.addItem(temp_committee[attendee_number],temp_committee[member_number]);
            }}
		}

		if ( show && prevProps.show !== show ) {
			const autoSuggest = TagHelpers.getAllItems();
			this.setState( { autoSuggest } );
		}
	}

	hideImgPreview = () => {
		this.setState({ isMouseInside: true });
	};

	showImgPreview = () => {
		this.setState({ isMouseInside: false });
	};

    setFormValues = ( obj ) => {
		const { formValues,list } = this.state;
        this.setState( { 
            formValues: { ...formValues, ...obj },
            
        
        
        } );
	};

    onClose = () => {
		const { onClose, setTags, setRecipeList, selectedMenu } = this.props;
		this.setState( { formValues: {}, errorValues: {},list:[],list2:[] } );
		setTags();
		setRecipeList( selectedMenu );
		onClose && onClose();
    };
    onSubmit = () => {
        
        
		const { t, id } = this.props;
        
        const { formValues } = this.state;
        const feather = require( 'feather-icons' );
		let isFormValid = true;
		let errorValues = {};

		let regex = /(http[s]?:\/\/)?[^\s(["<,>]*\.[^\s[",><]*/igm;

		// if ( ! isTextValid( formValues.title ) ) {
		// 	errorValues.title = t( 'This field is required!' );
		// 	isFormValid = false;
        // }
        
		// if ( ! isTextValid( formValues.categories ) ) {
		// 	errorValues.categories = t( 'This field is required!' );
		// 	isFormValid = false;
        // }


		if ( undefined === formValues.ingredients || '' === formValues.ingredients ) {
		} else {
			formValues.ingredients = formValues.ingredients.replace( /,/g, '.' );
			formValues.ingredients = formValues.ingredients.replace( /½/g, '1/2' );
			formValues.ingredients = formValues.ingredients.replace( /⅓/g, '1/3' );
			formValues.ingredients = formValues.ingredients.replace( /⅔/g, '2/3' );
			formValues.ingredients = formValues.ingredients.replace( /¼/g, '1/4' );
			formValues.ingredients = formValues.ingredients.replace( /¾/g, '3/4' );
			formValues.ingredients = formValues.ingredients.replace( /⅕/g, '1/5' );
			formValues.ingredients = formValues.ingredients.replace( /⅖/g, '2/5' );
			formValues.ingredients = formValues.ingredients.replace( /⅗/g, '3/5' );
			formValues.ingredients = formValues.ingredients.replace( /⅘/g, '4/5' );
			formValues.ingredients = formValues.ingredients.replace( /(?: )?(1+)\/(2+)/g, '.5' );
			formValues.ingredients = formValues.ingredients.replace( /(?:\n)+(.5+)/g, '\n0.5' );
			formValues.ingredients = formValues.ingredients.replace( /(?: )?(1+)\/(3+)/g, '.33' );
			formValues.ingredients = formValues.ingredients.replace( /(?:\n)+(.33+)/g, '\n0.33' );
			formValues.ingredients = formValues.ingredients.replace( /(?: )?(2+)\/(3+)/g, '.66' );
			formValues.ingredients = formValues.ingredients.replace( /(?:\n)+(.66+)/g, '\n0.66' );
			formValues.ingredients = formValues.ingredients.replace( /(?: )?(1+)\/(4+)/g, '.25' );
			formValues.ingredients = formValues.ingredients.replace( /(?:\n)+(.25+)/g, '\n0.25' );
			formValues.ingredients = formValues.ingredients.replace( /(?: )?(3+)\/(4+)/g, '.75' );
			formValues.ingredients = formValues.ingredients.replace( /(?:\n)+(.75+)/g, '\n0.75' );
			formValues.ingredients = formValues.ingredients.replace( /(?: )?(1+)\/(5+)/g, '.20' );
			formValues.ingredients = formValues.ingredients.replace( /(?:\n)+(.20+)/g, '\n0.20' );
			formValues.ingredients = formValues.ingredients.replace( /(?: )?(2+)\/(5+)/g, '.40' );
			formValues.ingredients = formValues.ingredients.replace( /(?:\n)+(.40+)/g, '\n0.40' );
			formValues.ingredients = formValues.ingredients.replace( /(?: )?(3+)\/(5+)/g, '.60' );
			formValues.ingredients = formValues.ingredients.replace( /(?:\n)+(.60+)/g, '\n0.60' );
			formValues.ingredients = formValues.ingredients.replace( /(?: )?(4+)\/(5+)/g, '.80' );
			formValues.ingredients = formValues.ingredients.replace( /(?:\n)+(.80+)/g, '\n0.80' );
			formValues.ingredients = formValues.ingredients.replace( /\d+/g, k => Number( k ).toFixed( 0 ) );
		}

		if ( ( formValues.servings > 1 ) && isNaN( formValues.servings ) ) {
			errorValues.servings = t( 'Not a valid number' );
			isFormValid = false;
		} else if ( '' === formValues.servings || 'undefined' === formValues.servings || isNaN( formValues.servings ) ) {
			formValues.servings = 1;
		}

		if ( undefined === formValues.sourceurl || '' === formValues.sourceurl ) {
		} else {
			if ( ! regex.test( formValues.sourceurl ) ) {
				errorValues.sourceurl = t( 'Non-valid URL' );
				isFormValid = false;
			}
		}

        if ( isFormValid ) {
            let dataToDb = { ...formValues };
            dataToDb.tags = dataToDb.tags || '';
            dataToDb.directions = dataToDb.directions || '';
            dataToDb.isfavorite = dataToDb.isfavorite || false;
            dataToDb.isTrash = dataToDb.isTrash || false;
            dataToDb.id = id || shortid.generate();

            if ( undefined === id ) {
                new Api().addNewRecipeItem( dataToDb );
               // new ApiCommittee().updateCommitteeCounter(formValues.categories,formValues.counter);
            } else {
                new Api().updateRecipeItem( dataToDb );
            }

            NotyHelpers.open( feather.icons.save.toSvg() + t( 'Saved' ), 'success', 1500 );
            this.onClose();

			// BUG: Lag
			setTimeout( function() {
				window.location.reload();
			}, 1500 );

        }

        this.setState({ errorValues });
    };

    _footer = () => {
        return (
            <div className='footer-buttons'>
                {/* <span className='crud-calculator' onClick={this.handleUnitConverter}>
                    <SvgIcon name='calculator'/>
                </span> */}
                <span onClick={this.onSubmit}>
                    <SvgIcon name='save'/>
                </span>
                <span onClick={this.onClose}>
                    <SvgIcon name='cancel'/>
                </span>
            </div>
        );
    };

    _headerIcons = () => {
        return (
            <div className='header-buttons'>
                {/* <span className='crud-calculator' onClick={this.handleUnitConverter}>
                    <SvgIcon name='calculator'/>
                </span> */}
                <span onClick={this.OnLatex}>
                    <SvgIcon name='print'/>
                </span>
                <span onClick={this.OnPrint}>
                    <SvgIcon name='calculator'/>
                </span>
                <span onClick={this.onSubmit}>
                    <SvgIcon name='save'/>
                </span>
                <span onClick={this.onClose}>
                    <SvgIcon name='cancel'/>
                </span>
            </div>
        );
    };

    // handleUnitConverter = () => {
    //     const unitConverter = document.querySelector( '.comp_unit-converter-modal' );
    //     unitConverter.classList.toggle( 'visible' );
    //     console.log( 'click' );
    // };


    
    
    addItem=(item,item2)=> {
        this.setState(state => ({
          list: [...state.list, item],
          list2:[...state.list2, item2]
        }));
      }
    attendees_details = (categories) => {
        
        // console.log(typeof(this.formValues)+'cool');
        const {formValues,list,list2,absenteetype,errorValues} = this.state;
        const { t} = this.props;

        const input_fields = []
        const input_fields2 = []
        if(1)
        {

                                                    
                                                
                for(let i=0;i<list.length;i++)
                {
                    let absentee_number = 'absentee_'+ (i);
                    
                    input_fields.push(<tr>
                    <td>{list[i]}</td>
                    <td>{list2[i]}</td>
                    <td>
                    <ChoiceField
                        name='absenteetype'
                        label={ <span> { ( 'Select from ' ) }</span> }
                        id={formValues[absentee_number]}
                        value={'undefined' !== typeof formValues[absentee_number] ? formValues[absentee_number] : ''}
                        options={absenteetype}
                        placeholder={''}
                        // errorText={errorValues.categories}
                        onChangeText={absenteetype => {this.setFormValues({ [absentee_number]:absenteetype })}}
                                    

                        />




                    </td>
                        
                            </tr> )}
                
                for(let i = 0;i<list.length;i++){
                    let absentee_number = 'absentee_'+ (i);
                    let absentee_details = absentee_number+'_details';
                    if(this.state.formValues[absentee_number] ==='Absent'){
                        input_fields2.push(
                            <TextField
                                name='title'
                                label={t( '' )}
                                value={this.state.formValues[absentee_details]}
                                placeholder = {'Reason for '+list[i]+'\'s absence'} 
                                errorText={errorValues.title}
                                onChangeText={item => this.setFormValues({[absentee_details]:item })}
                            />
                        )
                    }
                }            
            
            
            // if(this.state.formValues.categories!='undefined'&&list.servings>0){
            //     for (let i = 0; i < list.servings; i++) {
            //     let attendee_number = 'attendee_'+ (i);
            //         input_fields.push(
            //             <form>
            //                 <input
            //                     type='text'
            //                     placeholder = {list.attendee_number}
            //                     style={{backgroundColor:'#30404d' , color:"white"}}
            //                     value = {list.attendee_number}
            //                     // onChange={(event)=>{this.setFormValues({ [attendee_number]:event.target.value})}}
            //                 />
            //             </form>
            //         )
            //     }
        
            // }
    }

        return( 
            <div className='tech-three'>
                                
                                <table class="styled-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>MemberType</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {input_fields}
                                </tbody>
                                </table>
                             {input_fields2}
                            </div>
            
                    
            

       );
    }

    OnPrint = ()=>{
        const formValues = this.state.formValues;
        const { t} = this.props;
        const feather = require( 'feather-icons' );

        let options = {
            title: "Save file - Minutes of Meeting as pdf",
            buttonLabel : "Save pdf File",
            // filters :[
            //  {name: 'Images', extensions: ['jpg', 'png', 'gif']},
            //  {name: 'Movies', extensions: ['mkv', 'avi', 'mp4']},
            //  {name: 'Custom File Type', extensions: ['as']},
            //  {name: 'All Files', extensions: ['*']}
            // ]
           }

        let filename = dialog.showSaveDialogSync(curr_window, options); 
        formValues.file_path = filename;
        formValues.list = this.state.list;
        // console.log(filename);
        formValues.unique = formValues.counter+formValues.categories;
        NotyHelpers.open( feather.icons.save.toSvg() + t( 'Pdf generating...' ), 'success', 500 );
        ipcRenderer.send("pdftest",formValues); 
    }

    OnLatex = () => {
        const formValues = this.state.formValues;
        const { t} = this.props;
        const feather = require( 'feather-icons' );

        let options = {
            title: "Save file - Minutes of Meeting as Latex",
            buttonLabel : "Save Tex File",
            // filters :[
            //  {name: 'Images', extensions: ['jpg', 'png', 'gif']},
            //  {name: 'Movies', extensions: ['mkv', 'avi', 'mp4']},
            //  {name: 'Custom File Type', extensions: ['as']},
            //  {name: 'All Files', extensions: ['*']}
            // ]
           }

        let filename = dialog.showSaveDialogSync(curr_window, options); 
        formValues.file_path = filename;
        formValues.list = this.state.list;
        // console.log(filename);
        formValues.unique = formValues.counter+formValues.categories;
        NotyHelpers.open( feather.icons.save.toSvg() + t( 'Latex generating...' ), 'success', 500 );
        ipcRenderer.send("generate-latex",formValues); 
    }

    componentDidMount(){
        // const onprint = this.state.onprint;
        const { t} = this.props;
        const feather = require( 'feather-icons' );
        
        ipcRenderer.on("pdftestComplete",(event,arg1,arg2,arg3)=>{
            // const onprint = this.state.onprint;
            // this.setFormValues({'ingredients':lines})
            // console.log("Print event test sussccfeul:");
            const {formValues} = this.state;
            if(arg3===formValues.unique){
                if(arg1 === "error"){
                    NotyHelpers.open( feather.icons.save.toSvg() + t( 'Pdf generation failed with msg:'+arg2 ), 'error', 1500 );
                }else{
                    NotyHelpers.open( feather.icons.save.toSvg() + t( 'Pdf generation successful' ), 'success', 1500 );
                }
            }
        })

        ipcRenderer.on("latex-generated",(event,arg1,arg2,arg3)=>{
            const {formValues} = this.state;
            if(arg3===formValues.unique){
                if(arg1==="error"){
                    NotyHelpers.open( feather.icons.save.toSvg() + t( 'Latex generation failed with msg:'+arg2 ), 'error', 1500 );
                }else{
                    NotyHelpers.open( feather.icons.save.toSvg() + t( 'Latex file generation successful' ), 'success', 1500 );
                }
            }
        })
    }

    agendas = ()=>{
        const { t} = this.props;
        const { formValues, errorValues, autoSuggest,list} = this.state;

        const input_fields=[]

        for(let i = 0; i<formValues.no_agendas;i++){
            let agenda_number = i+1;
            let agenda_name = 'agenda_'+ (agenda_number)
            let agenda_details = 'agenda_'+(agenda_number)+'details'
            input_fields.push(
                <form>
                    <input
                        type='text'
                        placeholder = {'agenda'+ agenda_number+'_name'}
                        style={{backgroundColor:'#30404d' , color:"white"}}
                        value = {this.state.formValues[agenda_name]}
                        onChange={(item)=>{this.setFormValues({[agenda_name]:item.target.value})}}
                    />
                    <TextareaField
                        name='ingredients'
                        label={<span> {t( 'Agenda '+agenda_number +' details' )}</span>}
                        value={this.state.formValues[agenda_details]}
                        errorText={errorValues.ingredients}
                        onChangeText={item => this.setFormValues({ [agenda_details]:item })}
                    />
                </form>    
            )
        }

        return (input_fields)
    }
    
    render() {
        const { formValues, errorValues, autoSuggest,list} = this.state;
        const { t, id, show, committee_list} = this.props;

        // if(undefined !== id)
        // {
            
        //        // var slug = 'menu/'+categories;                                          
        //         //var temp = CommitteeHelpers.getCommittees(slug)
        //         var temp = new ApiCommittee().getCommitteeByTitle(formValues.categories)
        //         //this.addServings(temp.attendee_0);
        //         //this.setState({list:temp.attendee_0})
                
        //         for(let i=0;i<formValues.servings;i++)
        //         {
        //             let attendee_number = 'attendee_'+(i)
        //             let member_number = 'member_'+(i)
        //             this.addItem(temp[attendee_number],temp[member_number]);
        //         }
                
            
        // }
		const picsDirectory = StorageHelpers.preference.get( 'storagePath' ) + '/medias';
		if ( ! fs.existsSync( picsDirectory ) ) {
			fs.mkdirSync( picsDirectory );
		}

        // eslint-disable-next-line
        const modalTitle = `${undefined !== id ? t( 'Edit' ) : t( 'New' )}` + ' ' + `${t( 'Meeting' )}`;
        //const item = new Api().getRecipeById( id );
        //const previewImg = `${ undefined !== id ? StorageHelpers.readImg( item.picName ) : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAgAElEQVR4nO3daZAkZ33n8X9m1l1993RP9xw9M5rRCawDLIEsy4AQIMDGkpBm1kZiJBAgh3GsNxyx9q7DdozXfrFh767tWLBDWLZOJCTMtdiWNJY0CLNchsVLGKm7q+/7qK7urq67KjP3BbQYRnP0kVlPHt/P64knfzM90c8vr3+KAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+TFMdIEy+8sBcKtlivUUi1pt0w7pG062DWsTs1Qyr3YhYSdHtuGh2RNNsXXVWAHCSbWuW2FpDLK1qNvSyberrdsNYsi192jL1l6Wh/99yQf/2++/fV1KdNSwoAC555pHpfxdL2Mf1eONGI167Ipqq74mmajHRbNXRAMCbbE3qpVitXopmzWps2KpGvl6raJ977z0Hf6A6WhBRABzywmOzN0ii9tFoqv62aGt5IJqqR1RnAoAgqJeijfpGcqpeir4kldiDN39o/zdUZwoCCsAOPX3qh7HOq9ruj6Wq98bay6+Ppqsx1ZkAIAzqxXittp78t1op/vDqYP6BE6deV1OdyY8oANtw5owdacxP/UastfrxRHfpSiPW4F49AChk1iJWZSU1VNuIfzrSP/DJm27SGqoz+QUFYAtOPzH9tmi69sfJrsL1kSSX9gHAixrlaKOca/lWvRj7vXd/8OBLqvN4HQXgAs6csSPW0tTvxTvKv57oKvTwLwUAPmGLVHIty9W15F/qvQN/zFWB82NbO8ezD053RTsbn0r3FD4QSXFfHwD8rFGK14rLLV+or0Y+8Z6PHsypzuMlFIAf+9aXF/eWzeLfpPbm32vEubcPAEFiViNWabHtmVoh9ZFbTvYtqc7jBaEvAM8+ON0V66w/lO7P/xIP9QFAsJm1iFWcb/v72mr0w2G/IhDaAnDmjB2xlyc+ldqXvy+SqBuq8wAAmqdRiZqluba/0XoOfyKszwiEsgCcfmLy/vTejf8Zb6+kVGcBAKhTXU+Uioutv/XuDx56QHWWZgtVAXj+8flrYp0b/zu1N39UdRYAgHeUFttGa6utv/zOu/tfVp2lWUJRAOxTtv7C6yYfaDuwdp8ebYTi7wwA2B6rHrHzMx1/c/MPD92vndIs1XncFvjN8JnHp65r7S0+k+gqdqvOAgDwvkouvbKxlH7ve+8e+BfVWdwU2AJgn7L1F66e+Mv2Q2sf1yJmYP+eAADn2Q3DXp/s+PTNrxz+9aBeDQjkxvjck7MHk+2Ff071bhxSnQUA4F+lpdbJ8nrLL9zyq/unVWdxWuDeez/9xPTd7QdWRtn8AQC7lerdONR+YGX09BPTd6vO4rRAXQE483cTj7UMrNyt6bbqKACAALEtTQpT3Y/fdOfhD6nO4pRAFIAzTy+16Mm176T781erzgIACK7ifNsrVrnjzTed6C2ozrJbvi8AZ56YuyrWs/bteGepTXUWAEDwVVdT+dpyx1tu+uC+QdVZdsPXzwCcfnzq3cmD2R+w+QMAmiXeWWpLHsz+4PTjU+9WnWU3fFsATj859WsdR3PPRpK1qOosAIBwiSRr0Y6juWdPPzn1a6qz7JQvC8DzT0/+Yedl2b9iqh8AQBU92tA6L8v+1fNPT/6h6iw74bsN9IWnJ/+8/Uj2N0XjSX8AgAfYmqyP7/mLm08c+o+qo2yHrwrAi0+PP9B6ZOXjmq9SAwCCzrZFNsa7P/2OE0fuV51lq3yzlT7/uYm/7jic/ah/EgMAQsUWWZvY8+A7jx/+mOooW+GLZwBe/NzEJ9n8AQCepol0HM5+9MXPTXxSdZSt8HwBeOGpqT9qO7zyCTZ/AIDnaSJth1c+8cJTU3+kOsqleHpbff7JqU+0H81+UtMD+SEmAEBA2ZYu66N7fuOdvzrwKdVZLsSzBeDZz0zd2nV05Ys6n/IFAPiQ1TDs3Gj37e+5a+DLqrOcjyc31+cenXp9+5HV70eS9YjqLAAA7FSjHG2sj3e+8ZaTA/+mOsu5PPcMwBcfGu9I79v4Jps/AMDvIsl6JL1v45tffGi8Q3WWc3mqANinbL17b/27iY5yi+osAAA4IdFRbuneW/+ufcr21J7rqTAvvmH8s6ne/FHVOQAAcFKqN3/0xTeMf1Z1jrN5pgC88OT0x9oHVo+rzgEAgBvaB1aPv/DktGeGBHniIcCvPDR9ec/luVciibqhOgsAAG5pVKLmcqbr6vd/+GBGdRblVwDsU7be3ld8ic0fABB0kUTdaO8rvuSF5wGUBzjzhvFHUz2FftU5AABohlRPof/MG8YfVZ1DaQE4/eTMzS371+5SmQEAgGZr2b921+knZ25WmUHZMwBnztiRmPlKNt5RaleVAQAAVaprqfWacfWem27SGiqOr+4KQG78STZ/AEBYxTtK7ZIbf1LV8ZUUgGcen7ouvX/tDhXHBgDAK9L71+545vGp61QcW0kBSHeXvqRHLE+8gggAgCp6xNLS3aUvKTl2sw/4/FNTv5vqKexr9nEBAPCiVE9h3/NPTf1us4/b1LPwrzwwl9pz1cpqNF2NNfO4AAB4Wb0Yr2UHuzvff/++UrOO2dQrAC17Ko+w+QMA8NOi6WqsZU/lkWYes2lXAF54ZHp/6xUr03q0wb1/AADOYdUj9sZw98Gb7zk424zjNe0KgN5We5LNHwCA89OjDU1vqzXttcCmFIDnH5m5It2/fmMzjgUAgF+l+9dvfP6RmSuacaymFACjrfIwr/0BAHBxesTSjLbKw005ltsHeO7J2YMt+zaud/s4AAAEQcu+jeufe3L2oNvHcb0AROPVBzXD5OwfAIAt0AxTi8arD7p+HDcX/9bjK236ZTOreqyu/LPDAAD4hVWLWtbYgc7r7+7Ou3UMVzfmUiz/p2z+AABsjx6r66VY/k9dPYabiye6i3e5uT4AAEHl9h7qWgE4/cT03bH2Stqt9QEACLJYeyV9+onpu91a37UCEGup/Ge31gYAIAzc3EtdKQDPPjjdleotXOPG2gAAhEWqt3DNsw9Od7mxtisFINpu/b4e4dU/AAB2Q4+YWrTd+n1X1nZj0WhL+d+7sS4AAGETay2fcGNdxwvAC49M7090FfudXhcAgDCKdxb3PfvYhOP7qvNXAJLWf9IN2/FlAQAII92wJRrXfsfxdZ1eMNpSuc3pNQEACDM39lZHC8DTp34Yi3eUBpxcEwCAsIt3lAaePvXDmJNrOloAOq5oO2nEePofAAAnGTFT67ii7aSTazpaACKJ2q84uR4AAPgRp/dYRwtArKX6JifXAwAAP+L0HuvY5fqvPDCX2vszC0U9Yjm1JLbAMAyJx+MSi8UkGo2KYRii67po2o9+tJZliWVZUq/XpV6vS61Wk1qtJrbNmxoA4CdWQ5fF/9eXfv/9+0pOrBdxYhERkUTavI3N3126rks6nZaWlhZJp9OSTCYlFtv+MyGWZUmlUpFSqSSFQkEKhYJUq1UXEgMAnKJHLEmkzdtE5Akn1nOsAOjxxi85tRZ+IhKJSEdHh3R0dEhra6vo+u7v2ui6LqlUSlKplOzZs0dERKrVqqyvr8vq6qoUCoVdHwMA4Lwf77XeKgBGos79f4domiYdHR3S3d0tbW1tr17Od1M8Hpfe3l7p7e2VWq0muVxOstksVwYAwEMiifobHVvLqYWiqfp+p9YKq0gkIj09PdLT0yPRaFRZjlgsJn19fdLX1yf5fF4WFxcln88rywMA+JFIqn7AqbUcObW0T9n6v7zn+w09YjEDYAcikYj09fVJT0+PI5f43VAqlWRubk7W19dVRwGA0LIaun3ds2+MaKe0XT9058gVgGePTf9sD5v/tum6Ln19fbJ3717PbvybUqmUHDt2TIrFoszMzPCcAAAooEcs7fTl828Uke/tdi1HCkDEkBudWCdMurq65MCBA0ov9e9EOp2WK6+8UlZXV2V6elrq9brqSAAQKrreeKt4pQDoEfMNTqwTBvF4XAYGBqStrU11lF3p7OyUtrY2mZ2dleXlZdVxACA0nNpzHSkAmmFe5sQ6QdfT0yMHDhzw/OX+rTIMQwYGBqSzs1MmJiakVqupjgQAgefUnuvITmRErV4n1gmqSCQiR48elYGBgcBs/mdrbW2Va665Rjo7O1VHAYDAc2rPdWQ30iJWhxPrBFEqlZKrr75aOjqC/U9kGIZcdtllcvDgwabMLQCAsHJqz3XkFoARsdJOrBM0XV1dcvjw4VBtiL29vZJKpWR0dFQajYbqOAAQOE7tuY5cAdCj1vYH0gfcvn375MiRI6Ha/De1tLTIVVddJYlEQnUUAAgcp/ZcZ25I66ZjEwX9TtM0OXz4sPT396uOolQ8Hpcrr7xS0mkuDgGAoxzac515CDDiUJHwOU3T5LLLLpPu7m7VUTwhEonIFVdcIa2traqjAEBgOLXnOrNxa3b4rnOfY3PzD/rDftul67ocO3bM93MPAMAzHNpznSoAjizjV2z+F6fruhw9elRaWlpURwEA/3Noz+XSvQMGBgbY/C9h80pAKpVSHQUAIBSAXevv75c9e/aojuELhmHIsWPHJBbjpREAUI0CsAtdXV2yb98+1TF8JRqNyrFjxwI5EREA/ITfwjuUSqXk0KFDqmP4UjKZlMOHD6uOAQChRgHYgc2xt5zF7lxnZ6fs3btXdQwACC12sB04dOiQxONx1TF8b//+/TwUCACKUAC2qbu7m6/eOUTTNDly5AhXUgBAAX7zbkMsFpODBw+qjhEoiURC9u/frzoGAIQOBWAbBgYGxDAM1TECp7e3l28GAECTUQC2qKOjQ9rb21XHCKxDhw6F8suJAKAKBWALdF2XAwcOqI4RaMlkkoFKANBEFIAt6O3t5an/Jti3bx+3WACgSSgAl2AYhvT19amOEQqRSITZAADQJBSAS9i7dy9npU20d+9eiUQiqmMAQOBRAC7CMAzp7e1VHSNUdF2Xnp4e1TEAIPAoABfR3d3N2b8Cvb29DAcCAJfxW/YiOPtXIxKJSFdXl+oYABBoFIALaGtr48l/hXglEADcRQG4gO7ubtURQi2dTksikVAdAwACiwJwHrquS0dHh+oYoUcJAwD3UADOo729nYfQPICvLgKAe9jlzoOzf2+Ix+PcBgAAl1AAzqOtrU11BPwYPwsAcAcF4BzJZJJJdB5CAQAAd1AAztHS0qI6As6STqdVRwCAQKIAnIMNx1sikQjzGADABRSAc6RSKdURcA5+JgDgPArAOXjq3Hv4mQCA8ygAZ4nFYqJpmuoYOAe3AADAeRSAs8RiMdURcB78XADAeRSAs/D6nzdFo1HVEQAgcCgAZ6EAeJNhGKojAEDgUADOwvx/b+LnAgDO45QXnseDmYC/mKYplUpFGo2GWJYlmqZJJBKRRCLBlVYP4ScBANi1YrEoq6urks/npVwuX/DPxWIxaWtrk87OTkZ9K0YBOItt26oj4Dwsy1IdAcAFrK+vy9zcnJRKpS39+VqtJtlsVrLZrMRiMenv75fu7m6u9ClAATiLaZqqI+A8+LkA3lOr1WRqakrW19d3tcbk5KQsLS3J4cOHmfrZZDxddZZ6va46As6j0WiojgDgLBsbG/LKK6/savM/W7lclsHBQclms46sh62hAJyFAuBNtVpNdQQAP7a6uiqZTMbxYm7btkxOTsrk5KSj6+LCKABnYaPxJn4ugDcsLy/L2NiYq89LZbNZ+f73v+/a+vgJCsBZLMtis/GgSqWiOgIQegsLCzI1NdWUY1mWJYODg005VphRAM6x1SdZ0Tz8TAB1bNuWmZkZmZ2dbepxi8WiTE9PN/WYYUMBOAebjbfYtn3Rd4oBuGfzvvzi4qKS4y8tLcn8/LySY4cBrwGeo1AoqI6As5RKJeYzAApYliXj4+OytramNMfc3JyIiPT39yvNEUQUgHMUi0WxbZuhFB6xsbGhOgIQOqZpysjIiGdOiCgB7uAWwDksy/LMf3qI5PN51RGAUGk0GjI0NOS534Nzc3PcDnAYBeA8VF/ywo+Ypum5X0JAkFWrVRkcHPTsczeUAGdRAM6DAuANa2tr3P8HmqRcLsvQ0JBUq1XVUS6KEuAcCsB51Go1zjw9YHV1VXUEIBSKxaIMDw/7ZhoqJcAZFIALWFlZUR0h1Or1Ovf/gSbI5/MyPDzsu29uUAJ2jwJwAaurq3yGVqGVlRUu/wMuy+VyMjIy4tvfdZSA3aEAXIBpmlwFUMS2bVleXlYdAwi05eVlGR8f933RpgTsHAXgIlRNvwq71dVVvskAuKiZc/2bgRKwMxSAi6hWqzyIpsDCwoLqCEAgqZrr3wyUgO2jAFwC/6Gaa21tzbPvIAN+pnqufzNQAraHAnAJ5XJZcrmc6hihsTnyE4BzLMuSsbGxUDzXRAnYOgrAFszOzvr2KVk/yWaznP0DDjNNUzKZTKgGnFECtoYCsAW1Wi3Ql828wDTNQN6XBFTy6lz/ZqAEXBoFYIsWFhY8PyLTz2ZnZ303iATwMq/P9W8GSsDFUQC2yLKsQL024yXFYlGy2azqGEBg+GWufzNQAi6MArAN+XyejcphlmXJxMSE74eRAF7ht7n+zUAJOD8KwDZNT0/Tqh00MzMjlUpFdQwgEPw6178ZKAGvRQHYJsuyAjE+0wvW1tYY+Qs4xO9z/ZuBEvDTKAA7UCwWZXp6WnUMX6tWqzIxMaE6BhAIQZnr3wyUgJ+gAOzQ8vJyKIZquMGyLBkdHRXTNFVHAXwvaHP9m4ES8CMUgF2YnJwM5fu1uzU+Ph7qV5MAJwR5rn8zUAIoALti27aMjo7yENs2TE9Ph2oiGeCGMMz1b4awlwAKwC41Gg3JZDJ8vnYL5ufnZWlpSXUMwNfCNNe/GcJcAigADqjVapLJZHjv9iKWlpb40A+wS2Gc698MYS0BFACHVCoVhm9cwNLSEm9NALsU5rn+zRDGEkABcFClUmH85jnm5+fZ/IFdYq5/c4StBFAAHFatVmVoaEhKpZLqKMpNTU1x2R/YJeb6N1eYSgAFwAX1el2GhoZCe5/OsiwZGRlhyh+wS8z1VyMsJYAC4JLNYTdh+E90ts1Llevr66qjAL7GXH+1wlACIqoDBN3c3JwUi0U5fPiwRCLB/udeXV2VyclJJvwBu5TL5fhKpgds3sLs7+9XnMQdXAFogvX1dXn55Zcln8+rjuIKy7JkcnJSxsbG2PyBXWKuv7cE+UpAsE9JPaRer0smk5Genh45cOCA6HowutfGxoZMTk7ygBLggIWFBUb7elBQrwRQAJpseXlZ1tfX5eDBg9LR0aE6zo41Gg2ZnZ2VbDarOgrge7Zty+zsLKN9PSyIJYACoECtVpPR0VFpa2uTAwcOSDKZVB1py2zbluXlZZmfn+fhJMABm3P9Ge3rfUErARQAhfL5vLzyyivS1dUl/f39Eo/HVUe6qFwuJ3Nzc1zuBxxiWZaMj4+H9pVhPwpSCaAAKGbbtqysrEgul5POzk7p6+vz1BUBy7Ikl8vJwsICGz/gINM0ZWRkhNG+PhSUEkAB8AjbtiWXy0kul5PW1lbp6emRjo4O0TRNSZ5qtSrZbFay2SyX+gGHNRoNGR4eZrSvjwWhBFAAPGhjY0M2NjbEMAzp7OyUzs5OaW1tdb0M1Go1WVtbk9XVVc5KAJdUq1XJZDJcUQsAv5cACoCHmab56lm4YRjS2toqbW1t0tLS4shtgkajIcVi8dXCwfcLAHeVy2U+HR4wfi4BFACfME1T1tbWXn1YSNd1SSaTkkwmJR6PSywWk2g0KoZhiK7rr14tsCxLLMuSRqMhtVpNarWaVCoVKZfLnIEATVQsFmVkZIRbagHk1xJAAfApy7KkWCxKsVhUHQXAJeTzeRkdHRXLslRHgUv8WAIoAADgIub6h4ffSgAFAABcsry8LFNTU6pjoIn8VAIoAADgAub6h5dfSgAFAAAcxFx/iPijBFAAAMAhzPXH2bxeAigAAOAA5vrjfLxcAigAALBLzPXHxXi1BFAAAGAXmOuPrfBiCaAAAMAOMdcf2+G1EkABAIAdYK4/dsJLJYACAADbxFx/7IZXSgAFAAC2gbn+cIIXSgAFAAC2iLn+cJLqEkABAIAtYK4/3KCyBFAAAOASmOsPN6kqARQAALgA5vqjWVSUAAoAAJwHc/3RbM0uARQAADgHc/2hSjNLAAUAAM7CXH+o1qwSQAEAgB9jrj+8ohklgAIAAMJcf3iP2yWAAgAg9JjrD69yswTojq8IAD5SLBZleHiYzR+eNTc358oDqRQAAKGVz+dleHiYj/rA8yYmJhwvqRQAAKGUy+VkZGSEj/rAF0zTlOnpaUfXpAAACJ3l5WUZHx/noz7wldXVVSkWi46tRwEAECoLCwt81Ae+tbS05NhaFAAAoWDbtszMzPBRH/ja2tqamKbpyFq8Bggg8Jjrj6CwLEs2CuuOrEUBABBozPVH0Gxs5DUn1qEAAAgs5vojiCoVZ0ZVUwAABBJz/RFUtXrNkXUoAAACh7n+CDIeAoTn2LYtpVJJ8vm8FAoFqVQqUq/XxbZt0TRNIpGIxONxSafT0tbWJi0tLaLrvIgCZzHXH8HnzPwKCgB2zTRNWV5elmw2e8EzLtu2pV6vS71el0KhIIuLi2IYhuzZs0f27t0r0Wi0yakRRIVCQUZHRxntC2wBBQC7srKyIrOzszs62zJNUxYXF2VpaUn6+vqkr6+PKwLYsXw+L6Ojo4z2BbaIAoAdMU1TJiYmHHm1yrZtmZ+fl7W1NTl69KjE43EHEiJMcrmcTExMMNoX2AZOt7BttVpNhoaGHH+vulwuyyuvvOLorGsEH3P9gZ2hAGBbyuWyDA0NufZqlWmaMjg46Oi8awTX/Pw8c/2BHeIWALasmQ9YTU9PSzQalc7OTtePBf+xbVtmZ2dlcXFRdRTAt7gCgC3J5/OSyWSa+nT12NgYE9zwGrZty8TEBJs/sEsUAFxSLpeTkZERJU9XDw0N8UwAXmVZloyNjUkul1MdBfA9CgAuamlpSfkDVsPDw5QAiGmakslk+KgP4BAKAC5obm5OpqenVccQy7Ikk8lQAkKs0WjI0NAQt4QAB1EA8Bqb306fn59XHeVVm2d/lIDwqVarMjg4yEd9AIdRAPBTbNuWsbExyWazqqO8BiUgfDZfO+WjPoDzKAB4lWmaMjw87Ol7rJSA8CgUCjI8PMxHfQCXUAAgIv66x0oJCD4Vr50CYUMBgC/vsVICgkvla6dAmFAAQq5UKvn2HislIHiY6w80DwUgxDY2Nnx/j5USEBzM9QeaiwIQUmtrazIyMiKmaaqOsmuUAH+zbVtmZmZkbm5OdRQgVCgAIZTNZmVsbCxQ91gpAf7EXH9AHQpAyCwuLsrk5GQg77FSAvyFuf6AWhSAkNi8zDozM6M6iqsoAf7AXH9APQpACGyO9g3LZVZKgLf5aeYEEGQUgICzLEtGR0dlZWVFdZSmogR4kx9nTgBBRQEIsEajIZlMRtbX11VHUYIS4C3M9Qe8hQIQUPV6XYaHh0N/mZUS4A3M9Qe8hwIQQFxm/WmUALWY6w94EwUgYEqlkgwODkqtVlMdxVMoAWow1x/wLgpAgGyO9uVM6/woAc3FXH/A2ygAAbG6uiqZTCYQo33dRAloDub6A95HAQiA5eVlGRsb40xriygB7mGuP+AfFACf40xrZygBzmOuP+AvFACfsm1bpqamONPaBUqAc5jrD/gPBcCHbNuW8fFxWV5eVh3F9ygBu8dcf8CfKAA+Y5qmjIyMyOrqquoogUEJ2Dnm+gP+RQHwkc3Rvvl8XnWUwKEEbB8DpwB/owD4RK1Wk6GhITYoF1ECto65/oD/UQB8oFwuy+DgoFQqFdVRAo8ScGnM9QeCgQLgccViUYaGhvhl20SUgAtjrj8QHBQAD8vn8zI8PMx0PwUoAa/FXH8gWCgAHsUvW/UoAT/BXH8geCgAHrS0tMQvW4+gBDBtEggqCoDHzM3NyfT0tOoYOEtYSwBz/YFgowB4yNTUlMzPz6uOgfMIWwlgrj8QfBQAD7BtW8bGxhjt63FhKQHM9QfCgQKg2Oamwmhffwh6CWCuPxAeFACFGo2GDA8Py8bGhuoo2IaglgDm+gPhQgFQpFaryeDgoJRKJdVRsANBKwHM9QfChwKgwOZoX+ao+1tQSgBz/YFwogA0WaFQYLRvgPi9BDDXHwgvCkATra2tMdo3gPxaApjrD4QbBaBJVlZWZHR0lOl+AeW3EsCoaQAUgCZYWFiQiYkJ1THgMr+UAOb6AxChALhuZmZGZmdnVcdAk3i9BDDXH8AmCoBLGKUaXl4sAcz1B3AuCoALLMuS0dFRWVlZUR0FinipBFBGAZwPBcBhjUZDMpmMrK+vq44CxbxQApjrD+BCKAAOqtfrMjw8zChVvEplCWCuP4CLoQA4pFKpyNDQEKNU8RoqSgBz/QFcCgXAAaVSSYaHhxmligtqZglgrj+AraAA7NLGxgajfbElzSgBzPUHsFUUgF1YXV2VTCbDNDVsmZslgLn+ALaDArBDTFPDTrlRApjrD2C7KAA7sLCwIFNTU2z+2DEnSwBz/QHsBAVgG2zblunpaUb7whFOlACuRAHYKQrAFm1OU1taWlIdBQGymxLAXH8Au0EB2ALLsmRkZIRpanDFdksAc/0BOIECcAmNRkOGh4cln8+rjoIA22oJYK4/AKdQAC6iVqvJ0NCQJz7oguC7VAlgrj8AJ1EALqBSqcjg4KBUKhXVURAiFyoBzPUH4DQKwHkUi0UZHBxkoAqUOLcEMNcfgBsiqgN4TT6fl9HRUd6phlKbJWBgYEDm5uYY7QvAcRSAs+RyOZmYmOCdaniCadzaP+cAAA30SURBVJoyPj6uOgaAgKIA/NjS0pJMT0+rjgEAQFNQAERkbm5O5ufnVccAAKBpQl8AJicnJZvNqo4BAEBThbYAWJYl4+PjvFYFAAilUBaAzdG+GxsbqqMAAKBE6ApAvV6XkZERKZVKqqMAAKBMqApAtVqVkZERpvsBAEIvNAWgXC5LJpNhuh8AABKSAlAoFGRkZERM01QdBQAATwh8AVhfX5fR0VGm+wEAcJZAF4CVlRWZmJhQHQMAAM8JbAFYXFyUmZkZ1TEAAPCkQBaAmZkZWVxcVB0DAADPClQBsG1bpqamGO0LAMAlBKYAWJYlY2Njsr6+rjoKAACeF4gCYJqmjIyMSKFQUB0FAABf8H0BqNfrkslkpFwuq44CAIBv+LoAVKtVGR4ellqtpjoKAAC+4tsCUCqVZGRkhNG+AADsgC8LwMbGhoyMjIhlWaqjAADgS74rAKurqzI+Ps5oXwAAdsFXBSCbzcrU1BSbPwAAu+SbAjA/Py9zc3OqYwAAEAieLwC2bcvMzIwsLS2pjgIAQGB4ugDYti0TExOSy+VURwEAIFA8WwAsy5LR0VHJ5/OqowAAEDieLACmaUomk5Fisag6CgAAgeS5AsBoXwAA3OepAlCpVCSTyTDaFwAAl3mmABSLRRkZGZFGo6E6CgAAgeeJApDP52V0dJTRvgAANInyApDL5WRiYoLpfgAANJHSArC0tCTT09MqIwAAEErKCsDc3JzMz8+rOjwAAKGmpABMTU3J8vKyikMDAABpcgGwLEsmJiZkdXW1mYcFAADnaFoBYLQvAADe0ZQC0Gg0JJPJSKlUasbhAADAJbheAKrVqmQyGalWq24fCgAAbJGrBaBcLksmk5F6ve7mYQAAwDa5VgAKhYKMjIyIaZpuHQIAAOyQKwWgUChIJpNhtC8AAB6lO71gpVKRkZERNn8AADzM0QJgWZaMjY1x2R8AAI9ztAAsLCxIuVx2ckkAAOACxwpAvV6XxcVFp5YDAAAucqwALC0tcd8fAACfcKQA2JbIysqKE0sBAICL0hxZxZECUCwWbYb9AADgPk3zUAFYz685sQwAALgEQzdsJ9ZxpACUy0UnlgEAAJegac48vufIKtUaH/oBAKAZdC3iyBP3jhSAhsn9fwAAmkHXIo5sus5cR7BtR+5HAACAizMkWnFiHUcKgKYZDSfWAQAAlxJbd2IVZwqARDacWAcAAFycIbFpJ9ZxpAAYEp10Yh0AAHBxuh3/gSPrOLGIJfZ3nFgHAABcnCWRv3diHWcKgFZ8xol1AADAhem6IXcmrz/tyFpOLKJp2vecWAcAAFxYIpYytROa6cRajhSA++67b87Qo7wJAACAi6JayrGH7h37HHBMTy84tRYAAHgtXdIZ59ZyiCbxl5xaCwAAvJZhJ7/k1FqOFYBqfe3TTq0FAAB+mq7rYlYSn3JsPacWmlmY+IahRxgJDACACxKx1saJ+691ZAqgiIMF4NSpU42Y0Zp1aj0AAPATUa1tysn1HCsAIiIRST3n5HoAAOBHotL2lJPrOVoAGmbuD5xcDwAAiBhGRMys/kdOrqk5uZiIyCMPfaZaqRViTq8LAEBYtaZ6ix/80O0tTq7p6BUAEZGYdHzX6TUBAAizqNXxNafXdLwA6Fr0t51eEwCAsNJ1XTQr+ZtOr+v4LQARkUce+kytUitE3VgbAIAwaUl0Ve6653jS6XUdvwIgIpLQu7/uxroAAIRNXO950Y11XSkAtYJ8XNNcubgAAEBoGIYh0VrkY26s7UoB+NAn3jPSktjj2LQiAADCqCXWm7v1vhvn3FjblQIgIhKxuj/p1toAAIRB1N7z526t7dp1etu2tUcefrxRrZVcKxkAAARVMp62Tt57t+HW+q5tzpqm2Sl9Lw8DAgCwA0npc/zd/7O5enberu09HonwNiAAANsRiUQlbXWdcPMYrhaAW07+zFJbbH/GzWMAABA0bbH9mfd95E3Lbh7D9fvzcaPzdsNw7RYGAACBouuGRLX221w/jtsH+OUPvvmHbfF9M24fBwCAIGiN983edvf1L7t9nKY8oR81995mGJFmHAoAAN/SdUMSje47mnKsZhzk9nt/9nttif0TzTgWAAB+1Rbvn7rtIz/37WYcq2nv6McrPe/ijQAAAM7PMCJilDtvadbxmlYAbv3oz450xA5/t1nHAwDAT9qiB/71zvtvGGzW8Zo6pS9S2/eOZCJtN/OYAAB4XSKesqXS/fZmHrOpBeDW+67aaNEv+3QzjwkAgNe16IceOXH/tU39iJ6Sb/Z+9rEvFddLiykVxwYAwEtakl2Vu04eTzb7uEo+1BNr7L8tEuG1QABAuOm6IQlr4E4lx1Zx0A98+Lp/6kwc/Y6KYwMA4BXtsYP/ese9b/kHFcdW9qnegSvfdmNrqquu6vgAAKiUSrQ1JHngLaqOr6wAXHutVk/rx+7iVgAAIGx0XZe0ftl9J068rqYqg5KHAM/2hce++rXl0tAvqM4BAECzdCWPfOf4yXcrO/sXUXgFYNPto297e0e6r6Q6BwAAzdCS7KrcmXjXDapzKC8A2inNSphX/lw8llAdBQAAV0UjMTEqh96qndBM1VmUFwARkVvvueoHnZFrTum6J+IAAOA4TdOkI3L5f/uVj7/5X1RnEfHAMwBn+/zjZ76VLQ4rvScCAIAbupJHvn/85LvfpDrHJk+dcn9g5O03dLXsX1OdAwAAJ7WnejfuTLzrOtU5zuapAqCd0qx6oe/ylmSH8nsjAAA4IRlvNZPGscu9cN//bJ4qACIiH7z/2my6ceStiXiSrwYCAHwtGo1Ji3X45ls/+IZF1VnO5bkCICJy20fe/I02ufrXIpGo6igAAOyIYRjSql3xHz7wkRteUp3lfDxZAEREbr/3uk93Ra/+E8MwVEcBAGBbNE2TrthVf3b8wz//v1RnuRBPvQVwPl949OuPZysv32Xb3BEAAPjDnuRVT91x8m2/ojrHxXi+AIiIfP7Rl/4hWx58n+ocAABcSlfi2Onj99x8i+ocl+KLAiAi8rnHvvrCann4HVwJAAB4VVfy2EvHT978dtU5tsKzzwCc6/iH3n5zd+LYi5rmm84CAAgJTdOkK370q37Z/EV8VABERO44+Y6bu+LH/pESAADwCk3TpDN++TPH733nTaqzbIevCoCIyJ33vOMXuxNXPsF3AwAAqum6Lt2JKz57/J6bfPecmi930TtOvu2u7sTVf2oYEdVRAAAhZRgR6Yhe+d/vOPn2X1WdZSd8fS398w9//b4Ne/Svq7WKr/8eAAB/iccSdotc/tE7P3zD36rOslO+3zg///A3f76kjb9UqmwwMQgA4LpUos3s1I++9Zc+9OZvqM6yG74vACIiX3niu3s2GlMjG+XldtVZAADB1Z7cu9aRuPzoe068Lqc6y24FogCIiNi2rX3usdPfWatMXsusAACAkzRNk87EkW8fP/mu61VncYovHwI8H03T7BMnb7muK3bVf41F4zQAAIAj4rGE3R1//R8EafMXCdAVgLN99rF//pmGtfDNYiWXVJ0FAOBfraneYkrrf/Ntd1//suosTgtkARARsZ+2jafL//TVfG3yRsuyVMcBAPiIYRjSFj185njy5ndpJzRTdR43BLYAbHrq4a/dUZWZz5arGwwNAABcUjrRUU/ah2+/4963/IPqLG4KfAEQEfnuA9+NjiayL+Vr0z/H1QAAwPkYRkTaI4e+emfq5ncG9az/bKEoAJs+/8g/v7NkzX+5VFtNqc4CAPCO1mTvRkIOvu8DJ6/9uuoszRKqArDpcw+/+MmCNf3rtToTBAEgzBKxtJXWB/7Hnfe89bdVZ2m20G6Ajz76XDpuWc9vNOauN82G6jgAgCaKRePSoh/4qp3qv+XEidfVVOdRIbQFYNPTf/3SETOaf65QW7jcsnk+AACCzDAi0hbd/8N4o+Xdt95345zqPCqFvgBs+senv3bNemn9K4X64mWWFfhnPwAgVCKRqLTG9r8SbfS+7/YPv3FCdR4voACc47MPvHBU4pUvlsyl19cbNf59AMDH4rGknTb6vxerJ28N+xn/udjgLuDRR59LJ2z5TMXO/mK5WmCGAAD4SEuys5aQvX9nJvZ8OKz3+C+FArAFTz30wsdMo/CHxepyP7cHAMCbotGYpGN7p41Gx+/cee8NT6rO43UUgG14+ukzLVrZ/oua5O4s1VbbGCoEAGoZRkRaYt1rhtX5GTu157c42986CsAOPfRnX+xIdbX9ialtfKBSX+3ieQEAaI5EPGUn9PblqN35ZGPF+C8nfuuGsupMfsSm5QDbtrXPP/TVu6xI7Tdqdv711fpGumHWVccCgECIxxJ2zGgtRqXtX2PS9me3nnzzF1RnCgIKgAts29b+7m//z3skWvuoKaVrG3apt26W40weBIAL0zRNYtGEHTWS1YikFyKS/rZZjXz6xMd+/kXV2YKIDamJnn7gn9qNWOp22zBvEK16jWk3+iypt9tST9q2GbE1y7AsS7Nti58LgEDRNN3Wdd3WbN0UMRqGHi1rdnRN12Lzhh3/oVjG1xvFypdPfOKmguqsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDQ+f+cYDSuDJelSgAAAABJRU5ErkJggg==' }`;
        // const levels = [
        //     t( 'easy' ),
        //     t( 'medium' ),
        //     t( 'difficult' )
        // ];
        // const categories = committee_list;
        
        const categories = CommitteeHelpers.getCommittees('menu/all_recipes');
        //const categories = categories_l.title;

        
        return (
            
            <div className='comp_recipe-crud-modal'>
                <Modal
                    show={show}
                    onClose={this.onClose}
                    title={modalTitle}
                    footerTemplate={this._footer}
                    headerIconsTemplate={this._headerIcons}
                >

                    <div className='title-image-tech-wrapper'>
                        <div className='title-tech-wrapper'>
                            <TextField
                                name='title'
                                label={t( 'Title*' )}
                                value={'Meeting'+formValues.counter}
                                errorText={errorValues.title}
                                readOnly={'readOnly'}
                                onChangeText={title => this.setFormValues({ title })}
                            />

                            <div className='tech'>
                                {/* <ChoiceField
                                    name='difficultylevel'
                                    label={<SvgIcon name='difficulty'/>}
                                    id={formValues.difficultylevel}
                                    value={'undefined' !== typeof formValues.difficultylevel ? formValues.difficultylevel : ''}
                                    options={levels}
                                    placeholder={''}
                                    errorText={errorValues.difficultylevel}
                                    onChangeText={difficultylevel => this.setFormValues({ difficultylevel })}
                                /> */}
                                {/* <NumberField
                                    name='no_attendees'
                                    label={<span><SvgIcon name='servings'/> {t( 'Attendees' )}</span>}
                                    min={1}
                                    step={1}
                                    value={formValues.no_attendees}
                                    errorNumber={errorValues.servings}
                                    onChangeNumber={no_attendees => this.setFormValues({ no_attendees })}
                                /> */}
                                <TextField
                                    name='date_of_meeting'
                                    label={<span><SvgIcon name='clock'/> {t( 'Date of Meeting' )}</span>}
                                    value={formValues.date_of_meeting}
                                    errorText={errorValues.prep}
                                    onChangeText={ date_of_meeting=> this.setFormValues({ date_of_meeting })}
                                />
                                <TextField
                                    name='meet_time'
                                    label={<span><SvgIcon name='clock'/> {t( 'Meet time' )}</span>}
                                    value={formValues.meet_time}
                                    errorText={errorValues.cook}
                                    onChangeText={meet_time => this.setFormValues({ meet_time })}
                                />
                            </div>
                            
                                {this.attendees_details()}
                               
                            
                            

                            <div className='tech-two'>
                                <ChoiceField
                                    name='categories'
                                    label={ <span> { t( 'Select from ' ) }</span> }
                                    id={formValues.categories}
                                    value={'undefined' !== typeof formValues.categories ? formValues.categories : ''}
                                    options={categories}
									placeholder={''}
                                    errorText={errorValues.categories}
                                    onChangeText={categories => {
                                                
                                                this.setState({list:[],list2:[]});
                                                //this.attendees_details(categories);          
                                                if(categories!='')
                                                {
                                                    var slug = 'menu/'+categories;                                          
                                                    //var temp = CommitteeHelpers.getCommittees(slug)
                                                    var temp = new ApiCommittee().getCommitteeByTitle(categories)
                                                    //this.addServings(temp.attendee_0);
                                                    //this.setState({list:temp.attendee_0})
                                                    if(temp.id!=undefined)
                                                    {
                                                        for(let i=0;i<temp.servings;i++)
                                                        {
                                                            let attendee_number = 'attendee_'+(i)
                                                            let member_number = 'member_'+(i)
                                                            this.addItem(temp[attendee_number],temp[member_number]);
                                                        }
                                                        var counter = new Api().getAllCategories_counter(categories)
                                                        this.setFormValues({categories,'counter':counter.length+1})
                                                    }
                                                }

                                                
                                                
                                                
                                               // this.setState({list:temp.servings})
                                               // k = k+temp.attendee_0+temp.attendee_1
                                                
                                    }}
                                    // onChangeText={this.attendees_details(categories)}

                                />
                                {/* <TextField
                                    name='categories'
                                    label={<span><SvgIcon name='clock'/> {t( 'dropdowm or add new Committee' )}</span>}
                                    value={formValues.categories}
                                    errorText={errorValues.categories}
                                    onChangeText={categories => this.setFormValues({ categories })}
                                /> */}
                                {/* <div className='comp_fe_choice-field'>
									<div className='form-group rating'>
										<label className='form-label'>
											<span><SvgIcon name='toque'/> { t( 'Rating' ) }</span>
										</label>
										<StarRatingComponent
											name='rating'
											value={'undefined' !== typeof formValues.rating ? formValues.rating : 0}
                                            renderStarIcon={() => <SvgIcon name='star'/>}
											onStarClick={rating => this.setFormValues({ rating })}
											starColor='#ffb400'
											emptyStarColor='#333'
										/>
									</div>
                                </div> */}
                            </div>
                        </div>

                        {/* <div className='comp_fe_image-field'>
							<div className='image-preview' onClick={this.hideImgPreview}>
								<label className='form-label'>
									<span>{ t( 'Click to upload an image' ) }</span>
								</label>
								{this.state.isMouseInside ? null : <img className={id} src={previewImg} alt='' />}
							</div>
								{this.state.isMouseInside ?
									<div className='uploader-wrapper'>
										<div className='uploader-close' onClick={this.showImgPreview}>x</div>
										<ImageUploader
											className='image-uploader'
											name='image'
											accept='image/*'
											withPreview={true}
											withIcon={true}
											singleImage={true}
											buttonText={t( 'Choose an image' )}
											onChange={
												pic => {
													if ( pic[0] ) {
														const picName = pic[0].name;
														const initialPath = pic[0].path;
														const imgPath = picsDirectory + '/' + picName;
														fs.copyFileSync( initialPath, imgPath );
														this.setFormValues({ picName });
													}
												}
											}
											imgExtension={['.jpg', '.jpeg', '.png']}
											maxFileSize={1048576}
											label={t( 'Max file size 1mb - Type accepted jpg or png' )}
											fileSizeError={' ' + t( 'file size is too big' )}
											fileTypeError={' ' + t( 'is not supported file extension' )}
										/>
									</div>
								: null }
                        </div> */}
                    </div>

                    {/* <UrlField
                        name='sourceurl'
                        label={<span><SvgIcon name='global'/> {t( 'Source url' )}</span>}
                        value={formValues.sourceurl}
                        errorText={errorValues.sourceurl}
                        onChangeText={sourceurl => this.setFormValues({ sourceurl })}
                    /> */}
                    <TagsField
                        name='tags'
                        label={<span><SvgIcon name='tag'/> {t( 'Tags' )}</span>}
                        placeholder={t( 'Add tag...' )}
                        info={t( 'To add multiple tags, separate each one of them with a comma, then press Enter to validate' )}
                        value={formValues.tags || ''}
                        onChangeText={tags => this.setFormValues({ tags })}
                        suggestions={autoSuggest}
                    />

                    <NumberField
                        name='agendas'
                        label={<span> {t( 'No of agendas' )}</span>}
                        min={0}
                        step={0}
                        value={formValues.no_agendas}
                        errorNumber={errorValues.no_agendas}
                        onChangeNumber={no_agendas => this.setFormValues({ no_agendas })}
                    />
                    {this.agendas()}   

                    <div className='textareas-wrapper'>
                        {/* <TextareaField
                            name='ingredients'
                            label={<span> {t( 'Minutes of Meeting' )}</span>}
                            value={formValues.ingredients}
                            errorText={errorValues.ingredients}
                            onChangeText={ingredients => this.setFormValues({ ingredients })}
                        /> */}
                             

                        {/* <MarkdownField
                            name='directions'
                            label={t( 'Directions' )}
                            value={formValues.directions || ''}
                            onChangeText={directions => this.setFormValues({ directions })}
                        /> */}
                    </div>
                </Modal>
            </div>
        );
    }
}

RecipeCrudModalNotExtended.propTypes = {
    id: PropTypes.string,
    show: PropTypes.bool,
    onClose: PropTypes.func
};

const mapStateToProps = state => {
    const { selectedMenu } = state.sidebar;
    return { selectedMenu };
};

const mapDispatchToProps = ( dispatch ) => {
    return {
        setTags: () => ReduxHelpers.fillTags( dispatch ),
        setRecipeList: selectedMenu => ReduxHelpers.fillRecipes( dispatch, selectedMenu )
    };
};

const RecipeCrudModal = hoistStatics( withTranslation()( RecipeCrudModalNotExtended ), RecipeCrudModalNotExtended );

export default connect( mapStateToProps, mapDispatchToProps )( RecipeCrudModal );
