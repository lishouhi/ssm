<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%--
  Created by IntelliJ IDEA.
  User: Administrator
  Date: 2017/3/5
  Time: 17:22
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>Title</title>
    <style type="text/css">
        .formTable {border-collapse: collapse;font-size: 12px;}
        .formTable th {width: 20%;border: #ccc solid 1px;background-color: #F1F6FF;padding: 7px;vertical-align: middle;text-align: left;}
        .formTable td {width: 30%;border: #ccc solid 1px;padding: 7px;vertical-align: middle;text-align: left;}
        .formTable .btn{ vertical-align: middle;text-align:center; }
    </style>
</head>
<body>
    <table class="formTable">
        <thead>
            <tr>
                <th>序号</th>
                <th>用户名</th>
                <th>密码</th>
                <th>年龄</th>
            </tr>
        </thead>
        <c:forEach items="${users}" var="user">
            <tr>
                <td>${user.id}</td>
                <td>${user.userName}</td>
                <td>${user.password}</td>
                <td>${user.age}</td>
            </tr>
        </c:forEach>
    </table>
</body>
</html>
