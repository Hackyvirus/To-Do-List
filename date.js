function  day(){
const Today = new Date()
const options ={
    weekday:'long',
    day:'numeric',
    month:'long'
}
return day = Today.toLocaleDateString('en-Us',options)
}
module.exports=day
