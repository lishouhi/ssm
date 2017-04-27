package com.nfha.ssm.service.impl;

import com.nfha.ssm.modules.sys.entity.User;
import com.nfha.ssm.modules.sys.service.IUserService;
import junit.framework.TestCase;
import org.apache.log4j.Logger;

import com.alibaba.fastjson.JSON;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import javax.json.Json;
import java.util.List;

/**
 * Created by Administrator on 2017/3/5.
 */
public class UserServiceTest {

	private static Logger logger = Logger.getLogger(UserServiceTest.class);
	private static ApplicationContext ac = null;

	private static IUserService userSvc;

	@BeforeClass
	public static void before(){
		try {
			logger.info("BeforeClass");
			ac = new ClassPathXmlApplicationContext("spring-mybatis.xml");
			userSvc = (IUserService) ac.getBean("userService");
		}
		catch (Exception e){
			logger.error(e);
		}
	}

	@Test
	public void testGetUserById() throws Exception {
		User user = userSvc.getUserById(1);

		logger.info(JSON.toJSONString(user));
	}

	@Test
	public void testgetUserAll() throws Exception {
		List<User> user = userSvc.getUserAll();

		logger.info(JSON.toJSONString(user));
	}

}