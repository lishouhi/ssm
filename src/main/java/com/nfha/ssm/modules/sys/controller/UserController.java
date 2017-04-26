package com.nfha.ssm.modules.sys.controller;

import com.nfha.ssm.modules.sys.entity.User;
import com.nfha.ssm.modules.sys.service.IUserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.annotation.Resource;
import java.util.List;

/**
 * Created by Administrator on 2017/3/5.
 */
@Controller
@RequestMapping("/user")
public class UserController {
	@Resource(name = "userService")
	private IUserService userSvc;

	@RequestMapping(path = "/userList")
	public String userList(Model model){
		List<User>  userList= userSvc.getUserAll();
		model.addAttribute("users",userList);

		return "userList";
	}

	@RequestMapping(path = "/index")
	public String index(){
		return "/modules/sys/index";
	}

	@RequestMapping(path = "/genZoneScript")
	public String generateZoneScript(){
		return "/modules/gis/genZoneScript";
	}

	@RequestMapping(path = "/main")
	public String main(){
		return "/modules/sys/main";
	}
}
