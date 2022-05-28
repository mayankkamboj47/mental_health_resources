
function resourceToHTML(resource){
    let title = `<h2 class="resource_title">${resource.title}</h2>`;
    let address = `<address>${resource.address.join(' ')}</address>`;
    let description = `<p>${resource.description}</p>`;
    return title+address+description;
}
module.exports =  function(resources){
    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8"/>
            <title>A page here</title>
            <link rel="preconnect" href="https://fonts.gstatic.com">
            <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet"> 
            <style>
                body{
                    --c3:#804336; /* Primary color*/
                    --c2 :#FFC5B8;
                    --c1 : #80625C;
                    --c4: #FF866B;
                    --c5 : #CC6B56;
                    font-family: "Patrick Hand",'sans-serif';
                    color:var(--c1);
                    padding:0;
                    margin:0;
                }
                .resources{
                    padding:0 2rem;
                }
                .resource__title{
                    color:var(--c4);
                }
                .resource__tag{
                    background-color:var(--c1);
                    color:white;
                    border-radius:20px;
                    padding:0 0.5rem;
                }
                .resource__tag:first-of-type,.resource__tag--crisis{
                    margin-left:0;
                }
                .tags{
                    display:flex;
                    flex-wrap:wrap;
                    gap:0.5rem;
                }
                .filterform{
                    background: var(--c2);
                    padding: 2rem;
                }
                .filter_submit{
                    padding:1rem 2rem;
                    color:white;
                    background-color:var(--c1);
                    border-radius:10px;
                    border:0px;
                    margin-top:2rem;
                    transition:all 0.2s linear;
                }
                .filter_submit:hover{
                    background-color:var(--c3);
                }
            </style>
        </head>
        <body>
            <script>
                /**
                 * To do : 
                 * parseAddress(text)=>elt('address') turns possible links into URLs and replaces them with respective anchor elements
                 * write a form that can be used to filter the resources. 
                 * find out a way that you can display the resources in a pagination format so that you don't overwhelm the user. We may have to move back the data 
                 * to the server side eventually if it gets too much to all be downloaded over a network. Not yet though. 
                 * or we can write some simple functions hopefully. 
                 * 
                 * getData().filter(filter_options).splitbynumber(10)[0]
                 * data.filter(filter_options).splitbynumber(10)[1];
                 * data.filter(filter_options)
                 * 
                 * we have to implement : 
                 * filter()
                 * splitbynumber()
                 * 
                 * filter(filter_object)
                 * Takes a filter_object, and searches the given object for only those values which contain the given object : 
                 * Examples : 
                 * resources.filter({country:"United Kingdom",genre:["children","youth"]})
                 * Returns resources with country set to "United Kingdom" or  genre "children" or genre "youth" or both or all three. 
                 * Results are sorted in order of preference such that : 
                 * Resources with country are given most priority (+1 0 0 0)
                 * Resources with genre are given priority in order of number of tags matched. (0 +1 0 0 ) for each tag match.
                 * Resources with the type is then given priority (0 0 +1 0)
                 * Resources with crisis are then given priority (0 0 0 +1)
                 * 
                 * Test cases : 
                 * resources.filter({matchkey : "Therapy"})
                 * resources.filter({location:["Ireland","United Kingdom"], type : ["abuse"]})
                 * Functions that will be useful : Union, filter(Array method) on individual properties, 
                */
                const resources = ${JSON.stringify(resources)};
                function elt(name,attrs,...children){
                    let node = document.createElement(name);
                    for(let attr of Object.keys(attrs)){
                        node.setAttribute(attr,attrs[attr]);
                    }
                    for(let child of children){
                        if(typeof child==="string") child = document.createTextNode(child);
                        node.appendChild(child);
                    }
                    return node;
                }
                function hasSome(a,b){
                    return b.length===0 || b.some(v=>a.includes(v));
                    /** We could do a binary search in a */
                }
                function filter(resources,filter_obj){
                    let filter_keys = Object.keys(filter_obj);
                    return resources.filter(res=>{
                        return filter_keys.every(key=>{
                            let actual = res[key];
                            let expected = filter_obj[key];
                            return actual===expected || hasSome(actual,expected);
                        });
                    });
                }
                function filter_by_string(resources,string){
                    let queries = string.toLowerCase().split(' ');
                    if(queries.length===0) return resources;
                    return resources.filter(res=>{
                        let resource_text = JSON.stringify(res).toLowerCase();
                        return queries.every(q=>resource_text.indexOf(q)>-1);
                    });
                }
                function generate_checkboxes(string_array){
                    let checkboxes = string_array.map(val=>{
                        return elt('label',{},elt('input',{type:'checkbox',name:val}),val);
                    });
                    let check_all = elt('input',{type:'checkbox'});
                    check_all.addEventListener('change',(e)=>{
                        let check = e.target.checked;
                        for(let label of checkboxes){
                            let checkbox = label.querySelector('input');
                            checkbox.checked = check;
                        }
                    });
                    checkboxes = [elt('label',{},check_all,"Check All")].concat(checkboxes);
                    return checkboxes;
                }
                function resourceToHTML(resource){
                    let title = elt("h2",{"class":"resource__title"},resource.title);
                    let address = elt("address",{"class":"resource__address"},resource.address.join(" "));
                    let description = elt("p",{"class":"resource__description"},resource.description);
                    let types = resource.type.map(type=>elt("span",{"class":"resource__tag resource__tag--type"},type));
                    let crisis = resource.crisis?elt("span",{"class":"resource__tag resource__tag--crisis"},"Crisis"):"";
                    let locations = resource.location.map(place=>elt("span",{"class":"resource__tag"},place));
                    let genres = resource.genre.map(genre=>elt("span",{"class":"resource__tag resource__genre"},genre));
                    let tags = elt('section',{"class":"tags"},...types,...genres,...locations,crisis);
                    return elt("div",{},title,address,description,tags);
                }
                function createForm(resources){
                    let removeRepeats = (array)=>[...new Set(array)];
                    let getAll = (resources,value) => removeRepeats(resources.map(r=>r[value]).flat());
                    let locations = generate_checkboxes(getAll(resources,'location'));
                    let types = generate_checkboxes(getAll(resources,'type'));      
                    let genres = generate_checkboxes(getAll(resources,'genre'));
                    let locations_b = elt('div',{},
                    elt('h3',{},"Locations"),
                    ...locations
                    );
                    let types_b = elt('div',{},
                    elt('h3',{},"Type of Support"),
                    ...types
                    );
                    let genres_b = elt('div',{},
                    elt('h3',{},"Area in which you need help"),
                    ...genres
                    );
                    let submit_btn = elt('button',{'class':'filter_submit'},'Submit');
                    submit_btn.addEventListener('click',(e)=>{
                        e.preventDefault();
                        e.stopPropagation();
                        let get_checked = (labels)=>{
                            let checkednames = [];
                            for(let label of labels.slice(1)){
                                let checkbox = label.querySelector('input');
                                if(checkbox.checked) checkednames.push(checkbox.name);
                            }
                            return checkednames;
                        }
                        let filtered_resources = filter(resources,{
                            'location': get_checked(locations),
                            'type':get_checked(types),
                            'genre':get_checked(genres)
                        });
                        document.querySelector('.resources').remove();
                        document.body.appendChild(resourcesToHTML(filtered_resources));
                    });
                    let filter_search = elt('input',{placeholder:'Example : Support Groups'});
                    filter_search.addEventListener('keydown',(e)=>{
                        let filtered_resources = filter_by_string(resources,e.target.value);
                        document.querySelector('.resources').remove();
                        document.body.appendChild(resourcesToHTML(filtered_resources));
                    });
                    return elt('form',{"class":'filterform'},
                    elt('h2',{},'Filter'),
                    locations_b,
                    types_b,
                    genres_b,
                    submit_btn,
                    elt('h2',{},"Resources that include : "),
                    filter_search
                    );        
                }
                function resourcesToHTML(resources){
                    return elt("article",{class:'resources'},resources.length+' resources : ',...resources.map(resource=>resourceToHTML(resource)));
                }
                document.body.appendChild(createForm(resources));
                document.body.appendChild(resourcesToHTML(resources));
            </script>
        </body>
    </html>
    `;
}
