/**
 * @class AreaLinkage
 * 省-市-区县级联菜单/经销商-车系-车型级联菜单

 * @singleton
 */
var LinkAge= function(config){
	if(!config){ config = {}; }
	this.config=config;
};
LinkAge.prototype = {
		/**
		 * 车系车型下拉框
		 * @param url:请求地址,queryParams:参数,valueField:value对应的字段,textField:text对应的字段
		 * @returns this.carComBox
		 */
		carComBox:function(config){
			var carComBox = $('#'+config.comboxId).combobox({
			    url:config.url || '',
			    queryParams:config.queryParams || {},
			    valueField:'noId',
                textField:'name',
                oldValue:'',
			    editable:config.editable || false,
			    onSelect:config.onSelect,
			    onChange:config.onChange,
			    onClick:config.onClick,
			    loadFilter:function(data){
			    	if(config.loadFilter){
			    		config.loadFilter()
			    	}
			    	var selectValue = $(this).combobox('getValue');
			    	var selected = true;
			    	if(selectValue&&selectValue!=0){ selected=false; }
			    	var comboData = [{
			    		noId:'',
			    		name:'--请选择--',
			    		selected:selected
			    	}];
			    	
			    	for(var i = 0;i<data.length;i++){
			    		selected = false;
			    		if(selectValue == data[i].id){ selected=true; }
						var name = data[i].name;
						var noId = {
								id:data[i].id,
								no:data[i].no
						};
						noId = JSON.stringify(noId);
						var row = {
								name:name,
								noId:noId,
								selected:selected
						};
						comboData.push(row);
					}
			    	return comboData;
			    }
			});
			return carComBox;
		},
		
		/**
		 * 车型配置下拉框
		 * @param url:请求地址,queryParams:参数,valueField:value对应的字段,textField:text对应的字段
		 * @returns this.carTypeConfigComBox
		 */
		carTypeConfigComBox:function(config){
			this.carTypeConfigComBox = $('#carTypeConfig').combobox({
			    url:config.url || '',
			    queryParams:config.queryParams || {},
			    valueField:"configColor",
			    textField:"configName",
			    oldValue:'',
			    editable:config.editable || false,
			    onSelect:config.onSelect,
			    onChange:config.onChange,
			    onClick:config.onClick,
			    loadFilter:function(data){
			    	if(config.loadFilter){
			    		config.loadFilter();
			    	}
			    	var selectValue = $(this).combobox('getValue');
			    	var selected = true;
			    	if(selectValue&&selectValue!=0){ selected=false; }
			    	var comboData = [{
			    		configColor:'',
			    		configName:'--请选择--',
			    		selected:selected
			    	}];
			    	
			    	for(var i = 0;i<data.length;i++){
			    		selected=false;
			    		if(selectValue == data[i].id){ selected=true; }
			    		var name = data[i].name;
                        var configColor = {
                            id:data[i].id,
                            colorName:data[i].carTypeColorName,
                            colorId:data[i].carTypeColorId
                        };
                        configColor = JSON.stringify(configColor);
                        var row = {
                        		configColor:configColor,
                        		configName:name,
                        		selected:selected
                        };
						comboData.push(row);
					}
			    	return comboData;
			    }
			});
			return this.carTypeConfigComBox;
		},
		
		/**省-市-区县级联菜单
         *province(省):provinceName(省名)
         
         *city(市有邮编和区号，选择市可以级联邮编和区号):根据省得出,cityName(市名)、cityid(市id),zipCode(邮编),areaCode(区号)

         *district(区县有邮编，选择区县可以级联邮编):根据市得出,districtName(区县名)、districtid(区县id),zipCode(邮编)

         */ 
		/*
         * 省
         */
		getProvince:function(config){
			var pointer = this;
			this.province = $('#province').combobox({
                url:rootPath + '/org/address.do?type=province',
                valueField:'id',
                textField:'provinceName',
                editable:false,
                oldValue:'',
                loadFilter: function(data){//数据过滤
                	var selectValue = $(this).combobox('getValue');
        			var selected = true;
        			if(selectValue && selectValue!=0){selected = false;}
        			var provinceRows = [{
        				id:'',
        				provinceName:'--请选择--',
        				selected:selected
        			}];
        			$.each(data,function(i,value){
        				provinceRows.push(value);
        			});
        			return provinceRows;
        		},
                onClick:function(record){//选择数据时做的操作
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                	pointer.cityClear();
                	pointer.districtClear();
                    var provinceId = record.id;
                    var provinceName = record.provinceName;
                    if(provinceId){
                    	if(config && config.nextLinkage){
                            var url = rootPath + '/org/address.do?type=city&id='+provinceId;
                            pointer.city.combobox('reload',url);
                        }
                    }else{ provinceName=""; }
                    $('#provinceName').val(provinceName);
                    if(config && config.provinceChange){
                        config.provinceChange(provinceId);
                    }
                }
			});
			return this.province;
		},
		provinceClear:function(){
        	var pointer = this;
        	if(pointer.province){
        		pointer.province.combobox('clear');
        		pointer.province.combobox('loadData', {});
        		$('#provinceName').val("");
        	}
        },
		/*
         * 市
         */
		getCity:function(config){
			var pointer = this;
			this.city = $('#city').combobox({
                valueField:'idZipAreacode',
                textField:'name',
                oldValue:'',
                editable:false,
                loadFilter: function(data){//数据过滤
        			var selectValue = $(this).combobox('getValue');
        			var selected = false;
        			if(selectValue&&selectValue!=0){ selected=false; }
        			var cityRows = [{
        				idZipAreacode:'',
        				name:'--请选择--',
        				selected:selected
        			}];
        			for(var i = 0;i<data.length;i++){
        				selected = false;
        				if(selectValue == data[i].id){ selected=true; }
                        var cityName = data[i].cityName;
                        var idZipAreacode = {
                            id:data[i].id,
                            zip:data[i].zipCode || "",
                            Areacode:data[i].areaCode || ""
                        };
                        idZipAreacode = JSON.stringify(idZipAreacode);
                        var row = {
                                idZipAreacode:idZipAreacode,
                                name:cityName,
                                selected:selected
                        };
                        cityRows.push(row);
                    }
        			return cityRows;
        		},
                onClick:function(record){//选择数据时做的操作
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                	pointer.districtClear();
                	var data = record.idZipAreacode;
                	var cityName = record.name;
                	if(data){
                		data = eval('(' + data + ')');
                    	if(config && config.nextLinkage){
                            var url = rootPath + '/org/address.do?type=district&id='+data.id;
                            pointer.district.combobox('reload',url);
                        }
                    }else{ data = {};cityName=""; }
            		$('#cityName').val(cityName);
                    $('#cityid').val(data.id);
                    if(config && config.cityChange){
                        config.cityChange(data);
                    }
                }
			});
			return this.city;
		},
		cityClear:function(){
        	var pointer = this;
        	if(pointer.city){
        		pointer.city.combobox('clear');
        		pointer.city.combobox('loadData', {});
        		$('#cityName').val("");
                $('#cityid').val("");
        	}
        },
        /*
         * 区
         */
		getDistrict:function(config){
			this.district = $('#district').combobox({
                valueField:'idZip',
                textField:'name',
                editable:false,
                oldValue:'',
                loadFilter: function(data){//数据过滤
        			var selectValue = $(this).combobox('getValue');
        			var selected = true;
        			if(selectValue && selectValue!=0){ selected = false; }
        			var districtRows = [{
        				idZip:'',
        				name:'--请选择--',
        				selected:selected
        			}];
        			for(var i = 0;i<data.length;i++){
        				selected = false;
        				if(selectValue == data[i].id){ selected=true; }
                        var districtName = data[i].districtName;
                        var idZip = {
                            id:data[i].id,
                            zip:data[i].zipCode
                        };
                        idZip = JSON.stringify(idZip);
                        var row = {
                        		idZip:idZip,
                                name:districtName,
                                selected:selected
                        };
                        districtRows.push(row);
                    }
        			return districtRows;
        		},
                onClick:function(record){//选择数据时做的操作
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                	var data = record.idZip;
                	var districtName = record.name;
                    if(data){
                    	data = eval('(' + data + ')'); 
                    }else{ data = {};districtName=""; }
                    $('#districtName').val(districtName);
                    $('#districtid').val(data.id);
                    if(config && config.districtChange){
                        config.districtChange(data);
                    }
                }
			});
			return this.district;
		},
		districtClear:function(){
        	var pointer = this;
        	if(pointer.district){
        		pointer.district.combobox('clear');
        		pointer.district.combobox('loadData', {});
        		$('#districtName').val("");
                $('#districtid').val("");
        	}
        },
        /*********省->市->区级联**********/
		area:function(config){
			if(!config){
				config = {};
			}
			this.getDistrict({
				districtChange:config.districtChange
			});
			this.getCity({
				nextLinkage:true,
				cityChange:config.cityChange
			});
			this.getProvince({
				nextLinkage:true,
				provinceChange:config.provinceChange
			});
		},

        /*********省->市级联**********/
        provinceCity:function(config){
            if(!config){
                config = {};
            }
            this.getCity({
                nextLinkage:false,
                cityChange:config.cityChange
            });
            this.getProvince({
                nextLinkage:true,
                provinceChange:config.provinceChange
            });
        },        
		
		/**销售公司-车系-车型-车型配置级联,经销商业务
         * @param {boolean} nextLinkage(是否有下一级):true 有;false 无
         */
		/*销售公司->车系
		 * @param {function} salesCompanyChange:额外方法接口
		 */
		getSalesCompany:function(config){
            var pointer = this;
            this.salesCompany  = this.carComBox({
                comboxId:'salesCompany',
                url:rootPath + '/home/getSalesCompanies.do',
                onClick:function(record){
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                	pointer.carseriesClear();
                	pointer.carTypeClear();
                	pointer.carTypeConfigClear();
                	pointer.carSeriesTypeTreeClear();
                	var data = record.noId;
                    var salesCompanyName = record.name;
                    if(data && data != '0'){
                    	data = eval('(' + data + ')');
                    	if(config && config.nextLinkage){
                            var url = rootPath + '/home/getCarseries.do?salesCompanyId='+data.id;
                            pointer.carseries.combobox('reload',url);
                        }
                    }else{ data = {};salesCompanyName=""; }
                    
                    $('#salesCompanyId').val(data.id);//销售公司编码
                    $('#salesCompanyNo').val(data.no);//销售公司id
                    $('#salesCompanyName').val(salesCompanyName);//销售公司名称
                    if(config && config.salesCompanyChange){
                    	config.salesCompanyChange(data);
                    }

                }
            });
            return this.salesCompany
        },
        /*销售公司->车型配置树
		 * @param {function} salesCompanyChange:额外方法接口
		 */
		getSalesCompanyTree:function(config){
            var pointer = this;
            this.salesCompany  = this.carComBox({
                comboxId:'salesCompany',
                url:rootPath + '/home/getSalesCompanies.do',
                onClick:function(record){
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                	pointer.carseriesClear();
                	pointer.carSeriesTypeTreeClear();
                	var data = record.noId;
                    var salesCompanyName = record.name;
                    if(data && data != '0'){
                    	data = eval('(' + data + ')');
                    	if(config && config.nextLinkage){
                    		pointer.carTypeConfigTree.tree("options").url=rootPath + '/home/getCarTypeTreeBySalesCompanyId.do?salesCompanyId='+data.id;
                    		pointer.carTypeConfigTree.tree("reload");
                        }
                    }else{ data = {};salesCompanyName=""; }
                    
                    $('#salesCompanyId').val(data.id);//车系编码
                    $('#salesCompanyNo').val(data.no);//车系id
                    $('#salesCompanyName').val(salesCompanyName);//车系名称
                    if(config && config.salesCompanyChange){
                    	config.salesCompanyChange(data);
                    }

                }
            });
            return this.salesCompany
        },
        salesCompanyClear:function(){
        	var pointer = this;
        	if(pointer.salesCompany){
        		pointer.salesCompany.combobox('clear');
        		pointer.salesCompany.combobox('loadData', {});
        		$('#salesCompanyId').val("");//销售公司编码
                $('#salesCompanyNo').val("");//销售公司id
                $('#salesCompanyName').val("");//销售公司名称
        	}
        },
        
        /*车系->车型
		 * @param {function} carseriesChange:额外方法接口
		 */
        getCarseries:function(config){
            var pointer = this;
            this.carseries = this.carComBox({
                comboxId:'carSeries',
                onClick:function(record){
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                	pointer.carTypeClear();
                	pointer.carTypeConfigClear();
                	var data = record.noId;
                    var carSeriesName = record.name;
                    if(data && data != '0'){
                    	data = eval('(' + data + ')');
                    	if(config && config.nextLinkage){
                            var url = rootPath + '/home/getCarTypes.do?carseriesId='+data.id;
                            pointer.carType.combobox('reload',url);
                        }
                    }else{ data = {};carSeriesName=""; }
                    $('#carSeriesNo').val(data.no);//车系编码
                    $('#carSeriesId').val(data.id);//车系id
                    $('#carSeriesName').val(carSeriesName);//车系名称
                    if(config && config.carseriesChange){
                    	config.carseriesChange(data);
                    }
                }
            });
            return this.carseries;
        },
        /*车系->车型
         * 无经销商时使用
		 * @param {function} carseriesChange:额外方法接口
		 */
        getAllCarseries:function(config){
            var pointer = this;
            this.carseries = pointer.carComBox({
                comboxId:'carSeries',
                url:rootPath + '/home/getAllCarseries',
                onClick:function(record){
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                	pointer.carTypeClear();
                	pointer.carTypeConfigClear();
                	var data = record.noId;
                    var carSeriesName = record.name;
                    if(data && data != '0'){
                    	data = eval('(' + data + ')');
                    	if(config && config.nextLinkage){
                            var url = rootPath + '/home/getCarTypes.do?carseriesId='+data.id;
                            pointer.carType.combobox('reload',url);
                        }
                    }else{ data = {};carSeriesName=''; }
                    $('#carSeriesNo').val(data.no);//车系编码
                    $('#carSeriesId').val(data.id);//车系id
                    $('#carSeriesName').val(carSeriesName);//车系名称
                    if(config && config.carseriesChange){
                    	config.carseriesChange(data);
                    }
                }
            });
            return this.carseries;
        },
        /*车系->车型配置树
		 * @param {function} carseriesChange:额外方法接口
		 */
        getCarseriesTree:function(config){
            var pointer = this;
            this.carseries = this.carComBox({
                comboxId:'carSeries',
                onClick:function(record){
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                	pointer.carSeriesTypeTreeClear();
                	var data = record.noId;
                    var carSeriesName = record.name;
                    if(data && data != '0'){
                    	data = eval('(' + data + ')');
                    	if(config && config.nextLinkage){
                            pointer.carTypeConfigTree.tree("options").url=rootPath + '/home/getCarTypeTreeByCarSeriesId.do?carSeriesId='+data.id;
                    		pointer.carTypeConfigTree.tree("reload");
                        }
                    }else{ data = {};carSeriesName=""; }
                    $('#carSeriesNo').val(data.no);//车系编码
                    $('#carSeriesId').val(data.id);//车系id
                    $('#carSeriesName').val(carSeriesName);//车系名称
                    if(config && config.carseriesChange){
                    	config.carseriesChange(data);
                    }
                }
            });
            return this.carseries;
        },
        carseriesClear:function(){
        	var pointer = this;
        	if(pointer.carseries){
        		pointer.carseries.combobox('clear');
        		pointer.carseries.combobox('loadData', {});
        		$('#carSeriesNo').val("");//车系编码
                $('#carSeriesId').val("");//车系id
                $('#carSeriesName').val("");//车系名称
        	}
        },
        
        /*车型->车型配置
		 * @param {function} carTypeChange:额外方法接口
		 */
        getCarTypes:function(config){
            var pointer = this;
            this.carType = pointer.carComBox({
                comboxId:'carType',
                onClick:function(record){
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                	pointer.carTypeConfigClear();
                	var data = record.noId;
                    var carTypeName = record.name;
                    if(data && data != '0'){
                    	data = eval('(' + data + ')');
                    	if(config && config.nextLinkage){
                        	var url = rootPath + '/home/getCarTypeConfig.do?carTypeId='+data.id;
                            pointer.carTypeConfig.combobox('reload',url);
                        }
                    }else{ data = {};carTypeName=""; }
                    $('#carTypeId').val(data.id);//车型编码
                    $('#carTypeNo').val(data.no);//车型id
                    $('#carTypeName').val(carTypeName);//车型名称
                    if(config && config.carTypeChange){
                    	config.carTypeChange(data);
                    }
                }
            });
            return this.carType;
        },
        carTypeClear:function(){
        	var pointer = this;
        	if(pointer.carType){
        		pointer.carType.combobox('clear');
        		pointer.carType.combobox('loadData', {});
        		$('#carTypeId').val("");//车型编码
                $('#carTypeNo').val("");//车型id
                $('#carTypeName').val("");//车型名称
        	}
        },
        
        /*车型配置
         * 最后一级，无下级
		 * @param {function} carTypeConfigChange:额外方法接口
		 */
        getCarTypeConfig:function(config){
            var pointer = this;
            this.carTypeConfig = pointer.carTypeConfigComBox({
            	onClick:function(record){
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                    var data = record.configColor;
                    var carTypeConfigName = record.configName;
                    if(data && data != '0'){
                    	data = eval('(' + data + ')');
                    }else{ data = {};carTypeConfigName=""; }
                    $('#carTypeConfigId').val(data.id);
                    $('#carTypeConfigName').val(carTypeConfigName);
                    if(config && config.carTypeConfigChange){
                    	config.carTypeConfigChange(data);
                    }
                }
            });
            return this.carTypeConfig;
        },
        carTypeConfigClear:function(){
        	var pointer = this;
        	if(pointer.carTypeConfig){
        		pointer.carTypeConfig.combobox('clear');
        		pointer.carTypeConfig.combobox('loadData', {});
        		$('#carTypeConfigId').val("");
                $('#carTypeConfigName').val("");
        	}
        },
        
        /*车系车型配置树
         * 最后一级，无下级
		 * @param {function} carTypeConfigChange:额外方法接口
		 */
        getCarTypeConfigTree:function(config){
            var pointer = this;
            this.carTypeConfigTree= new TreeOpr({
            	treeID:'carSeriesTypeTree',
            	isLoadFilter:false,//树加载的数据，是否需要重新过滤。false：不需要，true或者不填：需要
            	onClick: function(node){
            		if(node.id){
            			$.ajax({
            		        url : rootPath + '/home/getCarTypeConfigPage.do',
            		        type : 'post',
            		        data : {id:node.id,carResourceType:node.carResourceType},
            		        success:function(data){
            		             $('#ConfigList').datagrid('loadData',data);
            		        },
            		        error:function(data){
            		        	MessageHelper.error({
            			    		msg: data.message
            			    	});
            		        }       
            		    });
            		}
            		if(config && config.carTypeConfigChange){
                    	config.carTypeConfigChange(data);
                    }
            	}
            }).getTree();
            return this.carTypeConfigTree;
        },
        carSeriesTypeTreeClear:function(){
        	var pointer = this;
        	if(pointer.carTypeConfigTree){
        		pointer.carTypeConfigTree.tree('loadData',[]);
        		$('#ConfigList').datagrid('loadData',[]);
        	}
        },
        
        /*********************销售公司-车系-车型-车型配置级联,厂家业务********************************/
        /*销售公司
		 * @param {function} salesCompanyChange:额外方法接口
		 */
		getSalesCompanyManu:function(config){
            var pointer = this;
            this.carComBox({
                comboxId:'salesCompany',
                url:rootPath + '/home/getSalesCompanies.do',
                onClick:function(record){
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                    pointer.dealerClaer();
                	pointer.carseriesManuClear();
                	pointer.carSeriesTypeTreeClear();
                	var data = record.noId;
                    var salesCompanyName = record.name;
                    if(data && data != '0'){
                    	data = eval('(' + data + ')');
                    }else{ data = {};salesCompanyName=""; }
                    $('#salesCompanyId').val(data.id);//销售公司编码
                    $('#salesCompanyNo').val(data.no);//销售公司id
                    $('#salesCompanyName').val(salesCompanyName);//销售公司名称
                    if(config && config.salesCompanyChange){
                    	config.salesCompanyChange(data);
                    }
                }
            });
            
        },
        
        /*经销商
		 * @param {function} salesCompanyChange:额外方法接口
		 */
        getDealer:function(config){
        	var pointer = this;
        	this.dealer = $('#dealer').searchbox({
        		onChange:function(){
        			pointer.carseriesManuClear();
                	pointer.carSeriesTypeTreeClear();
        			if(config && config.nextLinkage){
        				var salesCompanyId = $('#salesCompanyId').val();
        				var dealerOrgId = $('#dealerOrgId').val();
        				console.info(dealerOrgId);
        				if(salesCompanyId && dealerOrgId){
        					var url = rootPath + '/home/getCarseries.do?salesCompanyId='+salesCompanyId+'&dealerOrgId='+dealerOrgId;
                            pointer.carseriesManu.combobox('reload',url);
                        }
        			}
        			if(config && config.dealerChange){
                    	config.dealerChange();
                    }
        		}
        	});
        	return this.dealer;
        },
        dealerClaer:function(){
        	var pointer = this;
        	if(pointer.dealer){
        		console.info(123);
        		$("#dealerOrgId").val("");
            	$("#dealerOrgNo").val("");
        		$("#dealer").searchbox('clear');
        	}
        },
        /*车系->车型
		 * @param {function} carseriesChange:额外方法接口
		 */
        getCarseriesTreeManu:function(config){
            var pointer = this;
            this.carseriesManu = this.carComBox({
                comboxId:'carSeries',
                onClick:function(record){
                	var options = $(this).combobox('options');
                    var oldValue = options.oldValue;
                    if(oldValue == record){ return false; }
                    options.oldValue = record;//记录下旧的数据
                	pointer.carTypeClear();
                	pointer.carTypeConfigClear();
                	var data = record.noId;
                    var carSeriesName = record.name;
                    if(data && data != '0'){
                    	data = eval('(' + data + ')');
                    	if(config && config.nextLinkage){
                    		var salesCompanyId = $('#salesCompanyId').val();
            				var dealerOrgId = $('#dealerOrgId').val();
                			if(salesCompanyId && dealerOrgId){
	                            pointer.carTypeConfigTree.tree("options").url=rootPath + '/home/getCarTypeTreeByCarSeriesId.do?salesCompanyId='+salesCompanyId+'&dealerOrgId='+dealerOrgId+'&carSeriesId='+data.id;
	                    		pointer.carTypeConfigTree.tree("reload");
                			}
                        }
                    }else{ data = {};carSeriesName=""; }
                    $('#carSeriesNo').val(data.no);//车系编码
                    $('#carSeriesId').val(data.id);//车系id
                    $('#carSeriesName').val(carSeriesName);//车系名称
                    if(config && config.carseriesChange){
                    	config.carseriesChange(data);
                    }
                }
            });
            return this.carseriesManu;
        },
        carseriesManuClear:function(){
        	var pointer = this;
        	if(pointer.carseriesManu){
        		$('#carSeriesNo').val("");//车系编码
                $('#carSeriesId').val("");//车系id
                $('#carSeriesName').val("");//车系名称
        		pointer.carseriesManu.combobox('clear');
        		pointer.carseriesManu.combobox('loadData', {});
        	}
        },
        
        /******四级级联：销售公司->车系->车型->车型配置*******/
        salesCompanyCar:function(config){
        	if(!config){
        		config = {};
        	}
        	this.getCarTypeConfig({//车型配置
        		carTypeConfigChange:config.carTypeConfigChange
        	});
        	this.getCarTypes({//车型
                nextLinkage:true,
                carTypeChange:config.carTypeChange
            });
        	this.getCarseries({//车系
                nextLinkage:true,
                carseriesChange:config.carseriesChange
            });
            this.getSalesCompany({//销售公司
                nextLinkage:true,
                salesCompanyChange:config.salesCompanyChange
            });
        },
        
        /******三级级联：车系->车型->车型配置*******/
        carseriesCar:function(config){
        	if(!config){
        		config = {};
        	}
        	this.getCarTypeConfig({
        		carTypeConfigChange:config.carTypeConfigChange
        	});
        	this.getCarTypes({
                nextLinkage:true,
                carTypeChange:config.carTypeChange
            });
        	this.getAllCarseries({
                nextLinkage:true,
                carseriesChange:config.carseriesChange
            });
        },
        /******三级级联：销售公司->车系->车型*******/
        salesCompanyCarType:function(config){
        	if(!config){
        		config = {};
        	}
        	this.getCarTypes({//车型
                nextLinkage:false,
                carTypeChange:config.carTypeChange
            });
        	this.getCarseries({//车系
                nextLinkage:true,
                carseriesChange:config.carseriesChange
            });
            this.getSalesCompany({//销售公司
                nextLinkage:true,
                salesCompanyChange:config.salesCompanyChange
            });
        },
        /******三级级级联：销售公司->车系->车型配置树*******/
        salesCompanyCarConfigTree:function(config){
        	var pointer = this;
        	if(!config){
        		config = {};
        	}
        	this.getCarTypeConfigTree();//树
        	this.getCarseriesTree({//车系
        		nextLinkage:true,
        		carseriesChange:config.carseriesChange
        	});
            this.getSalesCompany({//销售公司
                nextLinkage:true,
                salesCompanyChange:config.salesCompanyChange
            });
        },
        
        /******两级级联：车系->车型*******/
        carseriesType:function(config){
        	if(!config){
        		config = {};
        	}
        	this.getCarTypes({
                nextLinkage:false,
                carTypeChange:config.carTypeChange
            });
        	this.getAllCarseries({
                nextLinkage:true,
                carseriesChange:config.carseriesChange
            });
        },
        /******两级级联：销售公司->车系*******/
        salesCompanyCarseries:function(config){
        	if(!config){
        		config = {};
        	}
        	this.getCarseries({//车系
                nextLinkage:false,
                carseriesChange:config.carseriesChange
            });
            this.getSalesCompany({//销售公司
                nextLinkage:true,
                salesCompanyChange:config.salesCompanyChange
            });
        },
        /******2级级级联：销售公司->车型配置树*******/
        salesCompanyConfigTree:function(config){
        	var pointer = this;
        	if(!config){
        		config = {};
        	}
        	this.getCarTypeConfigTree();//树
            this.getSalesCompanyTree({//销售公司
                nextLinkage:true,
                salesCompanyChange:config.salesCompanyChange
            });
        },
        
        
        /*********************销售公司-车系-车型-车型配置级联,厂家业务********************************/
        
        /******四级级联：销售公司->经销商->车系->车型配置*******/
        salesCompanyCarManu:function(config){
        	if(!config){
        		config = {};
        	}
        	this.getCarTypeConfigTree();//树
        	this.getCarseriesTreeManu({//车系
                nextLinkage:true,
                carseriesChange:config.carseriesChange
            });
        	this.getDealer({//经销商
                nextLinkage:true,
                dealerChange:config.dealerChange
            });
            this.getSalesCompanyManu({//销售公司
                nextLinkage:true,
                salesCompanyChange:config.salesCompanyChange
            });
        },
        /******三级级级联：销售公司->经销商->车系*******/
        salesCompanyCarseriesManu:function(config){
        	if(!config){
        		config = {};
        	}
        	this.getCarseriesTreeManu({//车系
                nextLinkage:false,
                carseriesChange:config.carseriesChange
            });
        	this.getDealer({//经销商
                nextLinkage:true,
                dealerChange:config.dealerChange
            });
            this.getSalesCompanyManu({//销售公司
                nextLinkage:true,
                salesCompanyChange:config.salesCompanyChange
            });
        }
};