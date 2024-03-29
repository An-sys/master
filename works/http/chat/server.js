//引入net模块
const net = require('net')
//用户对象存储客户内容
let users = {}

const server = net.createServer( (socket) => {
	//设置编码
	socket.setEncoding('utf8');
	//获取用户的内容  存储用户的信息
	let id = socket.remoteAddress + socket.remotePort;
	users[id] = { name : '', socket}
	//data事件
	socket.on('data',function(data){
		console.log(data)
		//显示当前在线用户
		if(users[id].name == ''){
			server.getConnections((err,connect)=>{
				//遍历发送给所有用户内容
				for(let usersId in users){
					users[usersId].socket.write(`当前用户${connect}人`+',欢迎用户:'+users[id].name+'\n')
				}
				//告诉用户的操作信息
				//发送给当前请求用户内容
				socket.write('查看当前在线用户:check\n')
				socket.write('退出聊天室:exit\n')
			})
		}
		//设置标记点获取第一个字符内容
		let flag = data.slice(0,1)
		switch(flag){
			//n开头的时候
			case 'n':{
				//截取第一个字符
				let login = data.split(':')[0]
				//输入的name的时候
				if(login == 'name'){
					//截取用户名
					let usersName = data.split(':')[1].split('\n')[0]
					//设置用户名
					users[id].name = usersName
					socket.write('LOGIN SUCCESS\n')
					break;
				}else{
					say(data)
					break;
				}
			}
			//@私聊
			case '@':{
				//截取@的用户,和@的内容
				let toName = data.split('@')[1].split(' ')[0] 
				let text = data.split('@')[1].split(' ')[1]
				//调用toUser函数
				toUser(toName,text)
				break
			}
			//查看在线用户信息
			case 'c':{
				let check = data.split('\n')[0]
				//check查看
				if(check == 'check'){
					//遍历,发送给查看的用户在线的人名
					for(let usersId in users){
						socket.write('在线用户:'+users[usersId].name+'\n') 
					}
					break
				}else{
					say(data)
					break;
				}
			}
			//退出客户端
			case 'e':{
				let check = data.split('\n')[0]

				if(check == 'exit'){
					//断开服务器
					socket.end() 
					break
				}else{
					say(data)
					break;
				}
			}

			default:{
				//say函数,发送给所有用户
				say(data)
			}
		}
	})
	//当有关闭事件时
	socket.on('end',function(end){
		//保存退出的用户id
		let back = users[id].name
		//删除用户在对象中的id
		delete users[id]
		console.log(back+'退出了聊天室\n')
		//遍历发送给所有用户退出的信息
		for(let usersId in users){
			users[usersId].socket.write('用户:'+back+'退出了聊天室\n')
		}
	})

	socket.on('error',function(){
		throw err
	})
	
	//群发
	function say(data){
		for(let usersId in users){
			//遍历,把信息发给不是本机的所有用户
			if(users[usersId] != users[id]){
				//users[usersId]其他用户,users[id]本机用户
				users[usersId].socket.write(users[id].name +':'+ data)
			}
		}
	}

	//私聊
	function toUser(toName,text){
		//设置一个空的标记点
		let toSocket = null;
		//遍历查找@的用户,使toSocket等于@用户
		for(let usersId in users){
			if(users[usersId].name == toName){
				toSocket = users[usersId]
				break
			}
		}
		//如果用@的用户就发送给他消息
		if(toSocket){
			toSocket.socket.write(users[id].name +':'+ text)
		}else{
			//如果没有就告诉当前用户@的用户不存在
			socket.write('不存在')	
		}
	}
})

//监听8000端口
server.listen(8000,()=>{
	console.log('ok')
}) 


