package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"github.com/gin-gonic/gin"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	"net/http"
	"path/filepath"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
	//
	// Uncomment to load all auth plugins
	// _ "k8s.io/client-go/plugin/pkg/client/auth"
	//
	// Or uncomment to load specific auth plugins
	// _ "k8s.io/client-go/plugin/pkg/client/auth/azure"
	// _ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	// _ "k8s.io/client-go/plugin/pkg/client/auth/oidc"
)

func collectMemory(pod v1.Pod) *resource.Quantity {
	var totalMemory int64 = 0

	for _, container := range pod.Spec.Containers {
		containerRequest, ok := container.Resources.Requests.Memory().AsInt64()
		if ok {
			totalMemory += containerRequest
		}
	}
	return resource.NewQuantity(totalMemory, resource.BinarySI)
}

func collectCPU(pod v1.Pod) *resource.Quantity {
	var totalCPU int64 = 0

	for _, container := range pod.Spec.Containers {
		containerRequest := container.Resources.Requests.Cpu().MilliValue()
		totalCPU += containerRequest
	}
	return resource.NewQuantity(totalCPU, resource.DecimalSI)
}

type PodData struct {
	Name      string `json: "name"`
	Namespace string `json: "namespace"`
	Memory    int64  `json: "memory"`
	CPU       int64  `json: "cpu"`
}

type NodeCapacity struct {
	Memory int64 `json: "memory"`
	CPU    int64 `json: "cpu"`
}
type NodeData struct {
	Capacity NodeCapacity `json: "capacity""`
	Pods     []PodData    `json: "pods""`
}

type ClusterData map[string]NodeData

func getNodeInfo(clientset *kubernetes.Clientset, node v1.Node) NodeCapacity {
	allocatable := node.Status.Allocatable
	memory, ok := allocatable.Memory().AsInt64()
	cpu := allocatable.Cpu().MilliValue()
	if ok {
		return NodeCapacity{Memory: memory, CPU: cpu}
	} else {
		return NodeCapacity{Memory: 0, CPU: 0}
	}
}

func getResourceRequests(clientset *kubernetes.Clientset) ClusterData {
	nodes, err := clientset.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
	clusterData := ClusterData{}
	if err != nil {
		panic(err.Error())
	}
	for _, node := range nodes.Items {
		capacity := getNodeInfo(clientset, node)
		opts := metav1.ListOptions{FieldSelector: fmt.Sprintf("spec.nodeName=%s", node.Name)}
		pods, err := clientset.CoreV1().Pods("").List(context.TODO(), opts)
		if err != nil {
			panic(err.Error())
		}
		var podData []PodData
		for _, pod := range pods.Items {
			memory, ok := collectMemory(pod).AsInt64()
			cpu, ok2 := collectCPU(pod).AsInt64()
			if ok && ok2 {
				podData = append(podData, PodData{Name: pod.Name, Namespace: pod.Namespace, Memory: memory, CPU: cpu})
			}
		}
		clusterData[node.Name] = NodeData{Capacity: capacity, Pods: podData}
	}
	return clusterData
}

func main() {

	var kubeconfig *string
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	}
	flag.Parse()

	// use the current context in kubeconfig
	config, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err != nil {
		panic(err.Error())
	}

	// create the clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	r := gin.Default()
	r.GET("/podrequests", func(c *gin.Context) {
		requests := getResourceRequests(clientset)
		byteslice, err := json.Marshal(requests)
		if err != nil {
			panic(err.Error())
		} else {
			c.Writer.Header().Set("Content-Type", "application/json")
			c.Writer.WriteHeader(http.StatusOK)
			c.Writer.Write(byteslice)
		}
	})
	r.Run()

}
